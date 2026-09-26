'use strict';

const express = require('express');
const router = express.Router();
const { getSettings, toggleAI, updateAISettings } = require('../../services/settingsService');
const authMiddleware = require('../middleware/auth');

/**
 * GET /api/settings
 * Returns current AI state.
 */
router.get('/', authMiddleware, (req, res) => {
  res.json(getSettings());
});

/**
 * POST /api/settings/toggle
 * Toggles the AI ON/OFF.
 */
router.post('/toggle', authMiddleware, (req, res) => {
  const { guildId } = req.body;
  if (!guildId) return res.status(400).json({ error: 'Missing guildId' });
  const result = toggleAI(guildId);
  res.json(result);
});

/**
 * POST /api/settings/ai
 * Updates Advanced AI settings (channel, api url, api key, model).
 */
router.post('/ai', authMiddleware, (req, res) => {
  const { guildId, aiChannel, aiApiUrl, aiApiKey, aiModel } = req.body;
  if (!guildId) return res.status(400).json({ error: 'Missing guildId' });
  const result = updateAISettings(guildId, { aiChannel, aiApiUrl, aiApiKey, aiModel });
  res.json(result);
});

/**
 * GET /api/settings/guilds
 * Returns list of user's guilds (with Manage Server/Admin perms), marking if the bot is in them.
 */
router.get('/guilds', authMiddleware, (req, res) => {
  const client = req.app.get('discordClient');
  const botGuilds = client.guilds.cache;

  if (!req.user || !req.user.guilds) {
    // Fallback to just bot guilds if user didn't use Discord OAuth
    const fallbackGuilds = botGuilds.map(g => ({
      id: g.id,
      name: g.name,
      icon: g.iconURL(),
      botInGuild: true
    }));
    return res.json(fallbackGuilds);
  }

  // Filter user guilds for Administrator (0x8) or Manage Server (0x20)
  const userManageableGuilds = req.user.guilds.filter(g => 
    (g.permissions & 0x8) === 0x8 || (g.permissions & 0x20) === 0x20
  );

  const mappedGuilds = userManageableGuilds.map(ug => {
    const isBotIn = botGuilds.has(ug.id);
    return {
      id: ug.id,
      name: ug.name,
      icon: ug.icon ? `https://cdn.discordapp.com/icons/${ug.id}/${ug.icon}.png` : null,
      botInGuild: isBotIn
    };
  });

  res.json(mappedGuilds);
});

/**
 * GET /api/settings/:guildId/channels
 */
router.get('/:guildId/channels', authMiddleware, (req, res) => {
  const { guildId } = req.params;
  const client = req.app.get('discordClient');
  const guild = client.guilds.cache.get(guildId);
  if (!guild) return res.status(404).json({ error: 'Guild not found' });

  const channels = guild.channels.cache
    .filter(c => c.type === 0) // Text channels
    .sort((a, b) => a.rawPosition - b.rawPosition)
    .map(c => ({ id: c.id, name: c.name }));
  res.json(channels);
});

/**
 * GET /api/settings/:guildId/stats
 * Returns real server stats (members, channels, icon)
 */
router.get('/:guildId/stats', authMiddleware, (req, res) => {
  const { guildId } = req.params;
  const client = req.app.get('discordClient');
  const guild = client.guilds.cache.get(guildId);
  if (!guild) return res.status(404).json({ error: 'Guild not found' });

  res.json({
    memberCount: guild.memberCount || 0,
    textChannels: guild.channels.cache.filter(c => c.type === 0).size || 0,
    voiceChannels: guild.channels.cache.filter(c => c.type === 2).size || 0,
    iconURL: guild.iconURL({ dynamic: true, size: 256 })
  });
});

/**
 * GET /api/settings/:guildId/roles
 */
router.get('/:guildId/roles', authMiddleware, (req, res) => {
  const { guildId } = req.params;
  const client = req.app.get('discordClient');
  const guild = client.guilds.cache.get(guildId);
  if (!guild) return res.status(404).json({ error: 'Guild not found' });

  const roles = guild.roles.cache
    .sort((a, b) => b.position - a.position)
    .map(r => ({
      id: r.id,
      name: r.name,
      color: r.color
    }));
  res.json(roles);
});

module.exports = router;
