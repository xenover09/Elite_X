'use strict';

const express = require('express');
const router = express.Router();

function adminMiddleware(req, res, next) {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized: Aapne dashboard par login nahi kiya hua! Pehle login karein.' });
  const adminId = process.env.ADMIN_ID || '1156595473126273045';
  if (req.user.id !== adminId) return res.status(403).json({ error: `Access Denied: Aapki logged-in Discord ID (${req.user.id}) ADMIN_ID se match nahi kar rahi.` });
  next();
}

/**
 * GET /api/admin/stats
 * Returns global bot statistics and guilds list.
 */
router.get('/stats', adminMiddleware, (req, res) => {
  const client = req.app.get('discordClient');
  
  if (!client) {
    return res.status(500).json({ error: 'Discord client not ready' });
  }

  const guilds = client.guilds.cache.map(g => ({
    id: g.id,
    name: g.name,
    ownerId: g.ownerId,
    memberCount: g.memberCount,
    joinedAt: g.joinedAt,
    icon: g.iconURL()
  }));

  const totalUsers = guilds.reduce((acc, g) => acc + g.memberCount, 0);

  res.json({
    totalGuilds: guilds.length,
    totalUsers: totalUsers,
    guilds: guilds
  });
});

const blacklistStore = require('../../store/blacklist');
const logger = require('../../utils/logger');

// --- BLACKLIST ROUTES ---

router.get('/blacklist', adminMiddleware, (req, res) => {
  res.json(blacklistStore.getBlacklist());
});

router.post('/blacklist', adminMiddleware, (req, res) => {
  const { type, id, reason } = req.body;
  if (type !== 'user' && type !== 'guild') {
    return res.status(400).json({ error: 'Type must be user or guild' });
  }
  if (!id || typeof id !== 'string' || !/^\d{17,20}$/.test(id)) {
    return res.status(400).json({ error: 'Invalid Discord ID format' });
  }
  blacklistStore.addToBlacklist(type, id, reason);
  res.json({ success: true, message: `Added ${type} ${id} to blacklist` });
});

router.delete('/blacklist', adminMiddleware, (req, res) => {
  const { type, id } = req.body;
  if (blacklistStore.removeFromBlacklist(type, id)) {
    res.json({ success: true, message: `Removed ${type} ${id} from blacklist` });
  } else {
    res.status(404).json({ error: 'Not found in blacklist' });
  }
});

// --- LOGS ROUTE ---

router.get('/logs', adminMiddleware, (req, res) => {
  const level = req.query.level || 'all';
  let limit = parseInt(req.query.limit, 10);
  if (isNaN(limit) || limit <= 0) limit = 100;

  let logs = logger.getLogs();
  if (level !== 'all') {
    logs = logs.filter(l => l.level.toLowerCase() === level.toLowerCase());
  }
  
  // Return the most recent logs first (reverse order)
  logs = logs.reverse().slice(0, limit);
  res.json(logs);
});

module.exports = router;
