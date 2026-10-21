const express = require('express');
const prisma = require('../config/db');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// ----------------------------------------------------
// 1. GET ALL JOBS (Full Search, Multi-Filter & Sorting)
// ----------------------------------------------------
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      q,
      location,
      minExp,
      maxExp,
      minSalary,
      maxSalary,
      workMode,
      department,
      employmentType,
      companyId,
      companyName,
      freshness, // 1, 3, 7, 14, 30
      sortBy = 'relevance',
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const take = Math.min(50, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNum - 1) * take;

    // Build Prisma where filter
    const where = {
      status: 'ACTIVE',
    };

    // Keyword search (Title, Description, or Skills)
    if (q && q.trim()) {
      const keyword = q.trim();
      where.OR = [
        { title: { contains: keyword } },
        { description: { contains: keyword } },
        { department: { contains: keyword } },
        {
          company: {
            name: { contains: keyword },
          },
        },
        {
          skills: {
            some: {
              skill: { contains: keyword },
            },
          },
        },
      ];
    }

    // Location search
    if (location && location.trim() && location.toLowerCase() !== 'all') {
      where.location = { contains: location.trim() };
    }

    // Work Mode (Remote, Hybrid, On-site)
    if (workMode && workMode.trim() && workMode.toLowerCase() !== 'all') {
      const modes = workMode.split(',').map((m) => m.trim());
      if (modes.length === 1) {
        where.workMode = { contains: modes[0] };
      } else {
        where.OR = modes.map((m) => ({ workMode: { contains: m } }));
      }
    }

    // Department / Industry
    if (department && department.trim() && department.toLowerCase() !== 'all') {
      const depts = department.split(',').map((d) => d.trim());
      where.department = { in: depts };
    }

    // Employment Type
    if (employmentType && employmentType.trim() && employmentType.toLowerCase() !== 'all') {
      where.employmentType = { contains: employmentType.trim() };
    }

    // Experience filters
    if (minExp !== undefined && minExp !== '') {
      const minE = parseInt(minExp);
      if (!isNaN(minE)) {
        where.maxExp = { gte: minE };
      }
    }
    if (maxExp !== undefined && maxExp !== '') {
      const maxE = parseInt(maxExp);
      if (!isNaN(maxE)) {
        where.minExp = { lte: maxE };
      }
    }

    // Salary filters (in LPA)
    if (minSalary !== undefined && minSalary !== '') {
      const minS = parseFloat(minSalary);
      if (!isNaN(minS)) {
        where.maxSalary = { gte: minS };
      }
    }
    if (maxSalary !== undefined && maxSalary !== '') {
      const maxS = parseFloat(maxSalary);
      if (!isNaN(maxS)) {
        where.minSalary = { lte: maxS };
      }
    }

    // Company filters
    if (companyId) {
      where.companyId = companyId;
    }
    if (companyName && companyName.trim()) {
      where.company = {
        name: { contains: companyName.trim() },
      };
    }

    // Date Posted / Freshness (in days)
    if (freshness && !isNaN(parseInt(freshness))) {
      const days = parseInt(freshness);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      where.createdAt = { gte: cutoffDate };
    }

    // Sorting
    let orderBy = [{ createdAt: 'desc' }];
    if (sortBy === 'salary_high') {
      orderBy = [{ maxSalary: 'desc' }, { createdAt: 'desc' }];
    } else if (sortBy === 'salary_low') {
      orderBy = [{ minSalary: 'asc' }, { createdAt: 'desc' }];
    } else if (sortBy === 'newest') {
      orderBy = [{ createdAt: 'desc' }];
    } else if (sortBy === 'relevance') {
      orderBy = [{ viewsCount: 'desc' }, { createdAt: 'desc' }];
    }

    // Execute queries in parallel
    const [jobs, totalJobs] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
              location: true,
              rating: true,
              reviewsCount: true,
            },
          },
          skills: {
            select: { skill: true },
          },
          _count: {
            select: { applications: true },
          },
        },
        orderBy,
        skip,
        take,
      }),
      prisma.job.count({ where }),
    ]);

    // Check user saved jobs and applications if user is authenticated
    let userSavedJobIds = new Set();
    let userAppliedJobIds = new Set();

    if (req.user) {
      const [saved, applied] = await Promise.all([
        prisma.savedJob.findMany({
          where: { candidateId: req.user.id },
          select: { jobId: true },
        }),
        prisma.jobApplication.findMany({
          where: { candidateId: req.user.id },
          select: { jobId: true },
        }),
      ]);
      userSavedJobIds = new Set(saved.map((s) => s.jobId));
      userAppliedJobIds = new Set(applied.map((a) => a.jobId));
    }

    // Format response
    const formattedJobs = jobs.map((job) => ({
      ...job,
      skills: job.skills.map((s) => s.skill),
      applicantCount: job._count.applications,
      isSaved: userSavedJobIds.has(job.id),
      hasApplied: userAppliedJobIds.has(job.id),
    }));

    return res.json({
      jobs: formattedJobs,
      pagination: {
        totalJobs,
        totalPages: Math.ceil(totalJobs / take),
        currentPage: pageNum,
        limit: take,
      },
    });
  } catch (error) {
    console.error('Fetch jobs error:', error);
    return res.status(500).json({ message: 'Failed to retrieve jobs.' });
  }
});

// ----------------------------------------------------
// 2. FEATURED & TRENDING JOBS (Homepage)
// ----------------------------------------------------
router.get('/featured', optionalAuth, async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { status: 'ACTIVE' },
      take: 8,
      orderBy: [{ viewsCount: 'desc' }, { createdAt: 'desc' }],
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            location: true,
            rating: true,
            reviewsCount: true,
          },
        },
        skills: {
          select: { skill: true },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    let userSavedJobIds = new Set();
    if (req.user) {
      const saved = await prisma.savedJob.findMany({
        where: { candidateId: req.user.id },
        select: { jobId: true },
      });
      userSavedJobIds = new Set(saved.map((s) => s.jobId));
    }

    const formatted = jobs.map((j) => ({
      ...j,
      skills: j.skills.map((s) => s.skill),
      applicantCount: j._count.applications,
      isSaved: userSavedJobIds.has(j.id),
    }));

    return res.json({ jobs: formatted });
  } catch (error) {
    console.error('Featured jobs error:', error);
    return res.status(500).json({ message: 'Failed to load featured jobs.' });
  }
});

// ----------------------------------------------------
// 3. JOB CATEGORIES & COUNTS
// ----------------------------------------------------
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.job.groupBy({
      by: ['department'],
      where: { status: 'ACTIVE' },
      _count: { id: true },
      orderBy: {
        _count: { id: 'desc' },
      },
    });

    const categoryList = categories.map((c) => ({
      name: c.department,
      count: c._count.id,
    }));

    return res.json({ categories: categoryList });
  } catch (error) {
    console.error('Categories error:', error);
    return res.status(500).json({ message: 'Failed to fetch categories.' });
  }
});

// ----------------------------------------------------
// 4. AUTOCOMPLETE SUGGESTIONS
// ----------------------------------------------------
router.get('/autocomplete', async (req, res) => {
  try {
    const { q = '', type = 'keyword' } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ suggestions: [] });
    }

    const query = q.trim();

    if (type === 'location') {
      const jobs = await prisma.job.findMany({
        where: {
          location: { contains: query },
          status: 'ACTIVE',
        },
        select: { location: true },
        distinct: ['location'],
        take: 6,
      });
      return res.json({
        suggestions: jobs.map((j) => j.location),
      });
    }

    // Default: title, company, skills
    const [titles, companies, skills] = await Promise.all([
      prisma.job.findMany({
        where: { title: { contains: query }, status: 'ACTIVE' },
        select: { title: true },
        distinct: ['title'],
        take: 4,
      }),
      prisma.company.findMany({
        where: { name: { contains: query } },
        select: { name: true },
        take: 3,
      }),
      prisma.jobSkill.findMany({
        where: { skill: { contains: query } },
        select: { skill: true },
        distinct: ['skill'],
        take: 4,
      }),
    ]);

    const suggestions = [
      ...titles.map((t) => ({ label: t.title, type: 'Role' })),
      ...companies.map((c) => ({ label: c.name, type: 'Company' })),
      ...skills.map((s) => ({ label: s.skill, type: 'Skill' })),
    ];

    return res.json({ suggestions });
  } catch (error) {
    console.error('Autocomplete error:', error);
    return res.status(500).json({ suggestions: [] });
  }
});

// ----------------------------------------------------
// 5. GET SINGLE JOB DETAILS
// ----------------------------------------------------
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        company: true,
        recruiter: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        skills: {
          select: { skill: true },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found or no longer active.' });
    }

    // Increment view count asynchronously
    prisma.job.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    }).catch(() => {});

    // Check user interaction states
    let isSaved = false;
    let applicationStatus = null;

    if (req.user) {
      const [saved, application] = await Promise.all([
        prisma.savedJob.findUnique({
          where: {
            candidateId_jobId: {
              candidateId: req.user.id,
              jobId: id,
            },
          },
        }),
        prisma.jobApplication.findUnique({
          where: {
            jobId_candidateId: {
              jobId: id,
              candidateId: req.user.id,
            },
          },
        }),
      ]);

      isSaved = !!saved;
      applicationStatus = application ? application.status : null;
    }

    return res.json({
      job: {
        ...job,
        skills: job.skills.map((s) => s.skill),
        applicantCount: job._count.applications,
        isSaved,
        applicationStatus,
      },
    });
  } catch (error) {
    console.error('Get job detail error:', error);
    return res.status(500).json({ message: 'Failed to retrieve job details.' });
  }
});

// ----------------------------------------------------
// 6. SIMILAR JOBS
// ----------------------------------------------------
router.get('/:id/similar', async (req, res) => {
  try {
    const { id } = req.params;
    const currentJob = await prisma.job.findUnique({
      where: { id },
      select: { department: true, location: true },
    });

    if (!currentJob) {
      return res.json({ jobs: [] });
    }

    const similar = await prisma.job.findMany({
      where: {
        id: { not: id },
        status: 'ACTIVE',
        OR: [
          { department: currentJob.department },
          { location: { contains: currentJob.location.split(',')[0] } },
        ],
      },
      take: 4,
      include: {
        company: {
          select: { id: true, name: true, logo: true, location: true, rating: true },
        },
        skills: { select: { skill: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      jobs: similar.map((j) => ({
        ...j,
        skills: j.skills.map((s) => s.skill),
      })),
    });
  } catch (error) {
    console.error('Similar jobs error:', error);
    return res.status(500).json({ jobs: [] });
  }
});

module.exports = router;
