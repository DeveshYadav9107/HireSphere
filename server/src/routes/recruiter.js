const express = require('express');
const prisma = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// ----------------------------------------------------
// 1. RECRUITER DASHBOARD METRICS
// ----------------------------------------------------
router.get('/stats', requireAuth, requireRole('RECRUITER', 'ADMIN'), async (req, res) => {
  try {
    const recruiterId = req.user.id;

    const [totalJobs, activeJobs, closedJobs, applications, viewsAggregate] = await Promise.all([
      prisma.job.count({ where: { recruiterId } }),
      prisma.job.count({ where: { recruiterId, status: 'ACTIVE' } }),
      prisma.job.count({ where: { recruiterId, status: 'CLOSED' } }),
      prisma.jobApplication.findMany({
        where: {
          job: { recruiterId },
        },
        select: { status: true },
      }),
      prisma.job.aggregate({
        where: { recruiterId },
        _sum: { viewsCount: true },
      }),
    ]);

    const totalApplicants = applications.length;
    const shortlistedCount = applications.filter((a) => a.status === 'SHORTLISTED' || a.status === 'INTERVIEW').length;
    const selectedCount = applications.filter((a) => a.status === 'SELECTED').length;

    return res.json({
      totalJobs,
      activeJobs,
      closedJobs,
      totalApplicants,
      shortlistedCount,
      selectedCount,
      totalViews: viewsAggregate._sum.viewsCount || 0,
    });
  } catch (error) {
    console.error('Recruiter stats error:', error);
    return res.status(500).json({ message: 'Failed to load recruiter statistics.' });
  }
});

// ----------------------------------------------------
// 2. GET RECRUITER POSTED JOBS
// ----------------------------------------------------
router.get('/jobs', requireAuth, requireRole('RECRUITER', 'ADMIN'), async (req, res) => {
  try {
    const recruiterId = req.user.id;

    const jobs = await prisma.job.findMany({
      where: req.user.role === 'ADMIN' ? {} : { recruiterId },
      include: {
        company: {
          select: { id: true, name: true, logo: true, location: true },
        },
        skills: {
          select: { skill: true },
        },
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = jobs.map((j) => ({
      ...j,
      skills: j.skills.map((s) => s.skill),
      applicantCount: j._count.applications,
    }));

    return res.json({ jobs: formatted });
  } catch (error) {
    console.error('Get recruiter jobs error:', error);
    return res.status(500).json({ message: 'Failed to retrieve posted jobs.' });
  }
});

// ----------------------------------------------------
// 3. POST A NEW JOB
// ----------------------------------------------------
router.post('/jobs', requireAuth, requireRole('RECRUITER', 'ADMIN'), async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const {
      title,
      companyId,
      companyName,
      department = 'Software Engineering',
      workMode = 'Hybrid',
      location,
      minExp = 0,
      maxExp = 5,
      minSalary,
      maxSalary,
      salaryCurrency = 'INR',
      employmentType = 'Full Time',
      description,
      requirements,
      benefits,
      status = 'ACTIVE',
      openings = 1,
      skills = [],
    } = req.body;

    if (!title || !description || !location) {
      return res.status(400).json({ message: 'Job title, location, and description are required.' });
    }

    // Resolve or find company
    let resolvedCompanyId = companyId;
    if (!resolvedCompanyId) {
      if (companyName && companyName.trim()) {
        const cName = companyName.trim();
        const slug = cName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        let company = await prisma.company.findFirst({
          where: { OR: [{ name: cName }, { slug }] },
        });
        if (!company) {
          company = await prisma.company.create({
            data: {
              name: cName,
              slug: slug || `company-${Date.now()}`,
              location: location,
              description: `${cName} is actively hiring top talent on HireSphere.`,
            },
          });
        }
        resolvedCompanyId = company.id;
      } else {
        // Fallback to first existing company
        const defaultCompany = await prisma.company.findFirst();
        resolvedCompanyId = defaultCompany ? defaultCompany.id : null;
      }
    }

    if (!resolvedCompanyId) {
      return res.status(400).json({ message: 'A valid company is required for posting a job.' });
    }

    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now().toString().slice(-6)}`;

    // Create job with skills
    const job = await prisma.job.create({
      data: {
        recruiterId,
        companyId: resolvedCompanyId,
        title: title.trim(),
        slug,
        department,
        workMode,
        location: location.trim(),
        minExp: parseInt(minExp) || 0,
        maxExp: parseInt(maxExp) || 5,
        minSalary: minSalary ? parseFloat(minSalary) : null,
        maxSalary: maxSalary ? parseFloat(maxSalary) : null,
        salaryCurrency,
        employmentType,
        description,
        requirements,
        benefits,
        status: ['ACTIVE', 'DRAFT'].includes(status) ? status : 'ACTIVE',
        openings: parseInt(openings) || 1,
        skills: {
          create: (Array.isArray(skills) ? skills : []).map((s) => ({
            skill: typeof s === 'string' ? s.trim() : s.skill,
          })),
        },
      },
      include: {
        company: true,
        skills: true,
      },
    });

    return res.status(201).json({
      message: 'Job posting published successfully!',
      job: {
        ...job,
        skills: job.skills.map((s) => s.skill),
      },
    });
  } catch (error) {
    console.error('Post job error:', error);
    return res.status(500).json({ message: 'Failed to create job posting.' });
  }
});

// ----------------------------------------------------
// 4. EDIT JOB POSTING
// ----------------------------------------------------
router.put('/jobs/:id', requireAuth, requireRole('RECRUITER', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.job.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    if (req.user.role === 'RECRUITER' && existing.recruiterId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to edit this job.' });
    }

    const {
      title,
      department,
      workMode,
      location,
      minExp,
      maxExp,
      minSalary,
      maxSalary,
      employmentType,
      description,
      requirements,
      benefits,
      status,
      openings,
      skills,
    } = req.body;

    // Update job
    const updated = await prisma.job.update({
      where: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...(department && { department }),
        ...(workMode && { workMode }),
        ...(location && { location: location.trim() }),
        ...(minExp !== undefined && { minExp: parseInt(minExp) }),
        ...(maxExp !== undefined && { maxExp: parseInt(maxExp) }),
        ...(minSalary !== undefined && { minSalary: minSalary ? parseFloat(minSalary) : null }),
        ...(maxSalary !== undefined && { maxSalary: maxSalary ? parseFloat(maxSalary) : null }),
        ...(employmentType && { employmentType }),
        ...(description && { description }),
        ...(requirements !== undefined && { requirements }),
        ...(benefits !== undefined && { benefits }),
        ...(status && { status }),
        ...(openings !== undefined && { openings: parseInt(openings) }),
      },
    });

    // Update skills if provided
    if (Array.isArray(skills)) {
      await prisma.jobSkill.deleteMany({ where: { jobId: id } });
      await prisma.jobSkill.createMany({
        data: skills.map((s) => ({
          jobId: id,
          skill: typeof s === 'string' ? s.trim() : s.skill,
        })),
      });
    }

    return res.json({
      message: 'Job posting updated successfully!',
      job: updated,
    });
  } catch (error) {
    console.error('Update job error:', error);
    return res.status(500).json({ message: 'Failed to update job.' });
  }
});

// ----------------------------------------------------
// 5. TOGGLE JOB STATUS (ACTIVE / CLOSED)
// ----------------------------------------------------
router.patch('/jobs/:id/status', requireAuth, requireRole('RECRUITER', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const existing = await prisma.job.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    if (req.user.role === 'RECRUITER' && existing.recruiterId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to change status of this job.' });
    }

    const updated = await prisma.job.update({
      where: { id },
      data: { status: status.toUpperCase() },
    });

    return res.json({
      message: `Job status updated to ${updated.status}.`,
      job: updated,
    });
  } catch (error) {
    console.error('Toggle status error:', error);
    return res.status(500).json({ message: 'Failed to update status.' });
  }
});

// ----------------------------------------------------
// 6. DELETE JOB
// ----------------------------------------------------
router.delete('/jobs/:id', requireAuth, requireRole('RECRUITER', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.job.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    if (req.user.role === 'RECRUITER' && existing.recruiterId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to delete this job.' });
    }

    await prisma.job.delete({ where: { id } });

    return res.json({ message: 'Job posting deleted successfully.' });
  } catch (error) {
    console.error('Delete job error:', error);
    return res.status(500).json({ message: 'Failed to delete job.' });
  }
});

module.exports = router;
