const express = require('express');
const prisma = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// ----------------------------------------------------
// 1. APPLY FOR A JOB (Candidate)
// ----------------------------------------------------
router.post('/apply', requireAuth, requireRole('CANDIDATE'), async (req, res) => {
  try {
    const candidateId = req.user.id;
    const { jobId, resumeId, coverNote, currentCtc, expectedCtc, noticePeriod } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required.' });
    }

    // 1. Verify Job exists and is active
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: { select: { name: true } },
        recruiter: { select: { id: true } },
      },
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    if (job.status !== 'ACTIVE') {
      return res.status(400).json({ message: 'This job posting is closed or no longer accepting applications.' });
    }

    // 2. Prevent duplicate application
    const existing = await prisma.jobApplication.findUnique({
      where: {
        jobId_candidateId: {
          jobId,
          candidateId,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ message: 'You have already applied for this job position.' });
    }

    // 3. Resolve resume if not passed
    let selectedResumeId = resumeId;
    if (!selectedResumeId) {
      const defaultResume = await prisma.resume.findFirst({
        where: { userId: candidateId, isDefault: true },
      });
      selectedResumeId = defaultResume ? defaultResume.id : null;
    }

    // 4. Create Application in Transaction & Notify
    const application = await prisma.$transaction(async (tx) => {
      const app = await tx.jobApplication.create({
        data: {
          jobId,
          candidateId,
          resumeId: selectedResumeId,
          coverNote: coverNote ? coverNote.trim() : null,
          currentCtc: currentCtc ? parseFloat(currentCtc) : null,
          expectedCtc: expectedCtc ? parseFloat(expectedCtc) : null,
          noticePeriod: noticePeriod || 'Immediate',
          status: 'APPLIED',
        },
      });

      // Notification to Candidate
      await tx.notification.create({
        data: {
          userId: candidateId,
          title: 'Application Submitted',
          message: `Your application for "${job.title}" at ${job.company.name} was successfully sent to the hiring team.`,
          type: 'APPLICATION',
          link: '/candidate/dashboard?tab=applications',
        },
      });

      // Notification to Recruiter
      if (job.recruiter) {
        await tx.notification.create({
          data: {
            userId: job.recruiter.id,
            title: 'New Applicant',
            message: `${req.user.name} applied for "${job.title}".`,
            type: 'APPLICATION',
            link: `/recruiter/dashboard?tab=applicants&jobId=${job.id}`,
          },
        });
      }

      return app;
    });

    return res.status(201).json({
      message: 'Your application was submitted successfully!',
      application,
    });
  } catch (error) {
    console.error('Apply job error:', error);
    return res.status(500).json({ message: 'Failed to submit application. Please try again.' });
  }
});

// ----------------------------------------------------
// 2. GET CANDIDATE'S APPLIED JOBS
// ----------------------------------------------------
router.get('/my', requireAuth, requireRole('CANDIDATE'), async (req, res) => {
  try {
    const applications = await prisma.jobApplication.findMany({
      where: { candidateId: req.user.id },
      include: {
        job: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                logo: true,
                location: true,
                rating: true,
              },
            },
            skills: { select: { skill: true } },
          },
        },
        resume: {
          select: {
            id: true,
            fileName: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    const formatted = applications.map((app) => ({
      id: app.id,
      status: app.status,
      appliedAt: app.appliedAt,
      coverNote: app.coverNote,
      currentCtc: app.currentCtc,
      expectedCtc: app.expectedCtc,
      noticePeriod: app.noticePeriod,
      resume: app.resume,
      job: {
        ...app.job,
        skills: app.job.skills.map((s) => s.skill),
      },
    }));

    return res.json({ applications: formatted });
  } catch (error) {
    console.error('Get my applications error:', error);
    return res.status(500).json({ message: 'Failed to load applied jobs.' });
  }
});

// ----------------------------------------------------
// 3. GET APPLICANTS FOR A RECRUITER JOB
// ----------------------------------------------------
router.get('/job/:jobId', requireAuth, requireRole('RECRUITER', 'ADMIN'), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status } = req.query;

    // Verify recruiter owns this job or is admin
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { recruiterId: true, title: true },
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    if (req.user.role === 'RECRUITER' && job.recruiterId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized. You can only view applicants for your own jobs.' });
    }

    const where = { jobId };
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const applications = await prisma.jobApplication.findMany({
      where,
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            candidateProfile: {
              include: {
                skills: true,
                experiences: true,
                educations: true,
              },
            },
          },
        },
        resume: {
          select: {
            id: true,
            fileName: true,
            fileSize: true,
            filePath: true,
            uploadedAt: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    return res.json({
      jobTitle: job.title,
      totalApplicants: applications.length,
      applications,
    });
  } catch (error) {
    console.error('Get job applicants error:', error);
    return res.status(500).json({ message: 'Failed to retrieve applicants.' });
  }
});

// ----------------------------------------------------
// 4. UPDATE APPLICATION STATUS (Recruiter / Admin)
// ----------------------------------------------------
router.patch('/:id/status', requireAuth, requireRole('RECRUITER', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'REJECTED', 'SELECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const application = await prisma.jobApplication.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            company: { select: { name: true } },
          },
        },
      },
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    // Permission check
    if (req.user.role === 'RECRUITER' && application.job.recruiterId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to manage applications for this job.' });
    }

    // Update status & notify candidate
    const updated = await prisma.$transaction(async (tx) => {
      const app = await tx.jobApplication.update({
        where: { id },
        data: {
          status,
          updatedAt: new Date(),
        },
      });

      // Notification
      const statusLabels = {
        UNDER_REVIEW: 'is now Under Review',
        SHORTLISTED: 'was Shortlisted 🎉',
        INTERVIEW: 'has an Interview Invitation 📅',
        REJECTED: 'was not selected for this position',
        SELECTED: 'has been Selected! 🏆 Congratulations!',
      };

      if (statusLabels[status]) {
        await tx.notification.create({
          data: {
            userId: application.candidateId,
            title: `Application Update: ${application.job.title}`,
            message: `Your application at ${application.job.company.name} ${statusLabels[status]}.`,
            type: 'STATUS_CHANGE',
            link: '/candidate/dashboard?tab=applications',
          },
        });
      }

      return app;
    });

    return res.json({
      message: `Applicant status updated to ${status}.`,
      application: updated,
    });
  } catch (error) {
    console.error('Update application status error:', error);
    return res.status(500).json({ message: 'Failed to update applicant status.' });
  }
});

module.exports = router;
