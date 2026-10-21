const express = require('express');
const prisma = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// ----------------------------------------------------
// 1. GET ALL NOTIFICATIONS FOR CURRENT USER
// ----------------------------------------------------
router.get('/', requireAuth, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, isRead: false },
    });

    return res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return res.status(500).json({ message: 'Failed to retrieve notifications.' });
  }
});

// ----------------------------------------------------
// 2. MARK NOTIFICATION AS READ
// ----------------------------------------------------
router.patch('/:id/read', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.notification.findUnique({ where: { id } });

    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return res.json({ message: 'Notification marked as read.', notification: updated });
  } catch (error) {
    console.error('Mark read error:', error);
    return res.status(500).json({ message: 'Failed to update notification.' });
  }
});

// ----------------------------------------------------
// 3. MARK ALL AS READ
// ----------------------------------------------------
router.patch('/read-all', requireAuth, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });

    return res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('Mark all read error:', error);
    return res.status(500).json({ message: 'Failed to mark all as read.' });
  }
});

module.exports = router;
