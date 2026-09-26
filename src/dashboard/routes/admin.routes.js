'use strict';

const express = require('express');
const router = express.Router();

function adminMiddleware(req, res, next) {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });
  if (req.user.id !== process.env.ADMIN_ID) return res.status(403).json({ error: 'Forbidden: Admins only' });
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
