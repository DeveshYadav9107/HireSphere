const express = require('express');
const prisma = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Apply admin guard to all routes in this file
router.use(requireAuth, requireRole('ADMIN'));

// ----------------------------------------------------
// 1. ADMIN DASHBOARD STATS
// ----------------------------------------------------
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalCandidates,
      totalRecruiters,
      totalJobs,
      activeJobs,
      totalApplications,
      totalCompanies,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'CANDIDATE' } }),
      prisma.user.count({ where: { role: 'RECRUITER' } }),
      prisma.job.count(),
      prisma.job.count({ where: { status: 'ACTIVE' } }),
      prisma.jobApplication.count(),
      prisma.company.count(),
    ]);

    return res.json({
      stats: {
        totalUsers,
        totalCandidates,
        totalRecruiters,
        totalJobs,
        activeJobs,
        totalApplications,
        totalCompanies,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({ message: 'Failed to load administrative stats.' });
  }
});

// ----------------------------------------------------
// 2. GET USERS LIST (Search & Role Filter)
// ----------------------------------------------------
router.get('/users', async (req, res) => {
  try {
    const { q, role, status } = req.query;

    const where = {};
    if (q && q.trim()) {
      where.OR = [
        { name: { contains: q.trim() } },
        { email: { contains: q.trim() } },
      ];
    }
    if (role && role !== 'ALL') {
      where.role = role.toUpperCase();
    }
    if (status && status !== 'ALL') {
      where.isActive = status === 'active';
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: {
            applications: true,
            recruiterJobs: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return res.json({ users });
  } catch (error) {
    console.error('Admin fetch users error:', error);
    return res.status(500).json({ message: 'Failed to load users.' });
  }
});

// ----------------------------------------------------
// 3. TOGGLE USER STATUS (Suspend / Activate)
// ----------------------------------------------------
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (id === req.user.id) {
      return res.status(400).json({ message: 'You cannot suspend your own administrator account.' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isActive: Boolean(isActive) },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        adminId: req.user.id,
        action: isActive ? 'USER_ACTIVATED' : 'USER_SUSPENDED',
        targetType: 'USER',
        targetId: id,
        details: `User ${user.email} status set to ${isActive ? 'active' : 'suspended'}.`,
      },
    });

    return res.json({
      message: `User ${user.name} is now ${user.isActive ? 'active' : 'suspended'}.`,
      user,
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    return res.status(500).json({ message: 'Failed to update user status.' });
  }
});

// ----------------------------------------------------
// 4. CHANGE USER ROLE
// ----------------------------------------------------
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['CANDIDATE', 'RECRUITER', 'ADMIN'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
    });

    await prisma.auditLog.create({
      data: {
        adminId: req.user.id,
        action: 'ROLE_CHANGED',
        targetType: 'USER',
        targetId: id,
        details: `Role updated to ${role} for user ${updated.email}.`,
      },
    });

    return res.json({ message: `Role updated to ${role}.`, user: updated });
  } catch (error) {
    console.error('Change user role error:', error);
    return res.status(500).json({ message: 'Failed to update user role.' });
  }
});

// ----------------------------------------------------
// 5. MODERATE JOBS (List All Jobs)
// ----------------------------------------------------
router.get('/jobs', async (req, res) => {
  try {
    const { q, status } = req.query;

    const where = {};
    if (q && q.trim()) {
      where.title = { contains: q.trim() };
    }
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        company: { select: { name: true, logo: true } },
        recruiter: { select: { name: true, email: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return res.json({ jobs });
  } catch (error) {
    console.error('Admin fetch jobs error:', error);
    return res.status(500).json({ message: 'Failed to load jobs.' });
  }
});

// ----------------------------------------------------
// 6. DELETE / REMOVE JOB
// ----------------------------------------------------
router.delete('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const job = await prisma.job.findUnique({ where: { id } });

    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    await prisma.job.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        adminId: req.user.id,
        action: 'JOB_DELETED',
        targetType: 'JOB',
        targetId: id,
        details: `Job listing "${job.title}" was removed by administrator.`,
      },
    });

    return res.json({ message: 'Job removed successfully.' });
  } catch (error) {
    console.error('Admin delete job error:', error);
    return res.status(500).json({ message: 'Failed to delete job.' });
  }
});

// ----------------------------------------------------
// 7. GET AUDIT LOGS
// ----------------------------------------------------
router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        admin: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return res.json({ logs });
  } catch (error) {
    console.error('Audit logs error:', error);
    return res.status(500).json({ message: 'Failed to fetch audit logs.' });
  }
});

module.exports = router;
