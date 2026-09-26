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

module.exports = router;
