const express = require('express');
const prisma = require('../config/db');

const router = express.Router();

// ----------------------------------------------------
// 1. GET ALL COMPANIES (Hiring, Ratings & Job Counts)
// ----------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const { q, industry, location } = req.query;

    const where = {};
    if (q && q.trim()) {
      where.name = { contains: q.trim() };
    }
    if (industry && industry.trim() && industry !== 'ALL') {
      where.industry = { contains: industry.trim() };
    }
    if (location && location.trim()) {
      where.location = { contains: location.trim() };
    }

    const companies = await prisma.company.findMany({
      where,
      include: {
        _count: {
          select: {
            jobs: {
              where: { status: 'ACTIVE' },
            },
          },
        },
      },
      orderBy: { rating: 'desc' },
    });

    const formatted = companies.map((c) => ({
      ...c,
      openJobsCount: c._count.jobs,
    }));

    return res.json({ companies: formatted });
  } catch (error) {
    console.error('Fetch companies error:', error);
    return res.status(500).json({ message: 'Failed to retrieve companies.' });
  }
});

// ----------------------------------------------------
// 2. GET COMPANY BY ID OR SLUG WITH JOBS
// ----------------------------------------------------
router.get('/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    const company = await prisma.company.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        jobs: {
          where: { status: 'ACTIVE' },
          include: {
            skills: { select: { skill: true } },
            _count: { select: { applications: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!company) {
      return res.status(404).json({ message: 'Company profile not found.' });
    }

    const formattedJobs = company.jobs.map((j) => ({
      ...j,
      skills: j.skills.map((s) => s.skill),
      applicantCount: j._count.applications,
    }));

    return res.json({
      company: {
        ...company,
        jobs: formattedJobs,
      },
    });
  } catch (error) {
    console.error('Get company detail error:', error);
    return res.status(500).json({ message: 'Failed to retrieve company details.' });
  }
});

module.exports = router;
