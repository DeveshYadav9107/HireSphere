const express = require('express');
const prisma = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// ----------------------------------------------------
// 1. GET ALL CANDIDATE JOB ALERTS
// ----------------------------------------------------
router.get('/', requireAuth, requireRole('CANDIDATE'), async (req, res) => {
  try {
    const alerts = await prisma.jobAlert.findMany({
      where: { candidateId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ alerts });
  } catch (error) {
    console.error('Fetch alerts error:', error);
    return res.status(500).json({ message: 'Failed to retrieve job alerts.' });
  }
});

// ----------------------------------------------------
// 2. CREATE JOB ALERT
// ----------------------------------------------------
router.post('/', requireAuth, requireRole('CANDIDATE'), async (req, res) => {
  try {
    const candidateId = req.user.id;
    const { title, keywords, location, minSalary, maxExp, frequency = 'DAILY' } = req.body;

    if (!title || !keywords) {
      return res.status(400).json({ message: 'Alert title and keywords are required.' });
    }

    const alert = await prisma.jobAlert.create({
      data: {
        candidateId,
        title: title.trim(),
        keywords: keywords.trim(),
        location: location ? location.trim() : null,
        minSalary: minSalary ? parseFloat(minSalary) : null,
        maxExp: maxExp !== undefined && maxExp !== '' ? parseInt(maxExp) : null,
        frequency,
        isActive: true,
      },
    });

    return res.status(201).json({
      message: 'Job alert created successfully! You will be notified of new matching opportunities.',
      alert,
    });
  } catch (error) {
    console.error('Create alert error:', error);
    return res.status(500).json({ message: 'Failed to create job alert.' });
  }
});

// ----------------------------------------------------
// 3. TOGGLE ACTIVE STATE
// ----------------------------------------------------
router.patch('/:id/toggle', requireAuth, requireRole('CANDIDATE'), async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.jobAlert.findUnique({ where: { id } });

    if (!existing || existing.candidateId !== req.user.id) {
      return res.status(404).json({ message: 'Job alert not found.' });
    }

    const updated = await prisma.jobAlert.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    return res.json({
      message: `Job alert ${updated.isActive ? 'enabled' : 'paused'}.`,
      alert: updated,
    });
  } catch (error) {
    console.error('Toggle alert error:', error);
    return res.status(500).json({ message: 'Failed to toggle alert.' });
  }
});

// ----------------------------------------------------
// 4. DELETE JOB ALERT
// ----------------------------------------------------
router.delete('/:id', requireAuth, requireRole('CANDIDATE'), async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.jobAlert.findUnique({ where: { id } });

    if (!existing || existing.candidateId !== req.user.id) {
      return res.status(404).json({ message: 'Job alert not found.' });
    }

    await prisma.jobAlert.delete({ where: { id } });
    return res.json({ message: 'Job alert deleted successfully.' });
  } catch (error) {
    console.error('Delete alert error:', error);
    return res.status(500).json({ message: 'Failed to delete alert.' });
  }
});

module.exports = router;
