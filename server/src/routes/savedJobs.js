const express = require('express');
const prisma = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// ----------------------------------------------------
// 1. SAVE A JOB
// ----------------------------------------------------
router.post('/:jobId', requireAuth, requireRole('CANDIDATE'), async (req, res) => {
  try {
    const { jobId } = req.params;
    const candidateId = req.user.id;

    // Check if job exists
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    const saved = await prisma.savedJob.upsert({
      where: {
        candidateId_jobId: {
          candidateId,
          jobId,
        },
      },
      update: {},
      create: {
        candidateId,
        jobId,
      },
    });

    return res.status(201).json({ message: 'Job saved to your profile.', saved });
  } catch (error) {
    console.error('Save job error:', error);
    return res.status(500).json({ message: 'Failed to save job.' });
  }
});

// ----------------------------------------------------
// 2. REMOVE SAVED JOB
// ----------------------------------------------------
router.delete('/:jobId', requireAuth, requireRole('CANDIDATE'), async (req, res) => {
  try {
    const { jobId } = req.params;
    const candidateId = req.user.id;

    await prisma.savedJob.deleteMany({
      where: {
        candidateId,
        jobId,
      },
    });

    return res.json({ message: 'Job removed from saved jobs.' });
  } catch (error) {
    console.error('Unsave job error:', error);
    return res.status(500).json({ message: 'Failed to remove saved job.' });
  }
});

// ----------------------------------------------------
// 3. GET CANDIDATE'S SAVED JOBS
// ----------------------------------------------------
router.get('/', requireAuth, requireRole('CANDIDATE'), async (req, res) => {
  try {
    const candidateId = req.user.id;

    const savedJobs = await prisma.savedJob.findMany({
      where: { candidateId },
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
      },
      orderBy: { savedAt: 'desc' },
    });

    const formatted = savedJobs.map((item) => ({
      savedAt: item.savedAt,
      job: {
        ...item.job,
        skills: item.job.skills.map((s) => s.skill),
      },
    }));

    return res.json({ savedJobs: formatted });
  } catch (error) {
    console.error('Get saved jobs error:', error);
    return res.status(500).json({ message: 'Failed to retrieve saved jobs.' });
  }
});

module.exports = router;
