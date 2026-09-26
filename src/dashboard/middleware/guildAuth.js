'use strict';

/**
 * Middleware to verify if the authenticated user has Admin or Manage Server
 * permissions in the target guild. 
 * Prevents IDOR (Insecure Direct Object Reference).
 */
async function guildAuthMiddleware(req, res, next) {
  // If not logged in via Discord, reject (unless legacy API key logic was re-enabled, but we removed it)
  if (!req.user || !req.user.guilds) {
    return res.status(401).json({ success: false, message: 'Unauthorized: User not authenticated' });
  }

  const client = req.app.get('discordClient');
  if (!client) {
    return res.status(500).json({ success: false, message: 'Internal error: Discord client not available' });
  }

  let guildId = req.body.guildId || req.query.guildId || req.params.guildId;

  // If there's no direct guildId, check if channelId is provided
  if (!guildId) {
    const channelId = req.body.channelId || req.query.channelId || req.params.channelId;
    if (channelId) {
      try {
        const channel = await client.channels.fetch(channelId);
        if (channel && channel.guild) {
          guildId = channel.guild.id;
        }
      } catch (err) {
        return res.status(404).json({ success: false, message: 'Channel not found or inaccessible' });
      }
    }
  }

  // If still no guildId, we can't authorize guild-level access.
  // Some endpoints might not need a guildId, but if they use this middleware, they do.
  if (!guildId) {
    return res.status(400).json({ success: false, message: 'Bad Request: Missing guildId or channelId' });
  }

  // Find the guild in the user's OAuth guilds
  const userGuild = req.user.guilds.find(g => g.id === guildId);
  if (!userGuild) {
    return res.status(403).json({ success: false, message: 'Forbidden: You do not have access to this server' });
  }

  // Check permissions (Admin = 0x8, Manage Server = 0x20)
  const perms = BigInt(userGuild.permissions);
  const isAdmin = (perms & 0x8n) === 0x8n;
  const isManageServer = (perms & 0x20n) === 0x20n;

  if (!isAdmin && !isManageServer) {
    return res.status(403).json({ success: false, message: 'Forbidden: You must be an Administrator or have Manage Server permissions' });
  }

  // Attach resolved guildId to request for convenience
  req.targetGuildId = guildId;
  next();
}

module.exports = guildAuthMiddleware;
