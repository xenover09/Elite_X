'use strict';

const express = require('express');
const router = express.Router();
const queueService = require('../../services/queueService');
const { sendPanel, lockChannel, unlockChannel, clearChat } = require('../../services/panelService');
const authMiddleware = require('../middleware/auth');
const guildAuthMiddleware = require('../middleware/guildAuth');

const multer = require('multer');
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

/**
 * POST /api/panel/send
 * Pushes a new embed panel request to the queue.
 */
router.post('/send', authMiddleware, guildAuthMiddleware, upload.single('image'), (req, res) => {
  let { channelId, title, description, color, buttons } = req.body;
  const imageFile = req.file;

  if (!channelId) {
    return res.status(400).json({ success: false, message: "channelId is required" });
  }

  // Parse buttons if it's a string (from FormData)
  if (typeof buttons === 'string') {
    try {
      buttons = JSON.parse(buttons);
    } catch (e) {
      buttons = [];
    }
  }

  // Basic validation
  if (title && title.length > 256) return res.status(400).json({ error: "Title too long" });
  if (description && description.length > 4000) return res.status(400).json({ error: "Description too long" });

  queueService.add({
    channelId,
    title,
    description,
    color,
    image: imageFile ? {
      buffer: imageFile.buffer,
      name: imageFile.originalname,
      mimetype: imageFile.mimetype
    } : null,
    buttons: Array.isArray(buttons) ? buttons.slice(0, 5) : []
  });

  res.json({ success: true, message: "Panel added to queue" });
});

/**
 * POST /api/panel/lock
 * Locks a channel for specific roles.
 */
router.post('/lock', authMiddleware, guildAuthMiddleware, async (req, res) => {
  const { channelId, roleIds } = req.body;
  if (!channelId || !roleIds) return res.status(400).json({ error: "Missing parameters" });

  try {
    await lockChannel({ channelId, roleIds });
    res.json({ success: true, message: "Channel locked successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/panel/unlock
 * Unlocks a channel by resetting everyone role permissions.
 */
router.post('/unlock', authMiddleware, guildAuthMiddleware, async (req, res) => {
  const { channelId } = req.body;
  if (!channelId) return res.status(400).json({ error: "channelId is required" });

  try {
    await unlockChannel(channelId);
    res.json({ success: true, message: "Channel unlocked successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/panel/clear
 * Clears a channel by cloning.
 */
router.post('/clear', authMiddleware, guildAuthMiddleware, async (req, res) => {
  const { channelId } = req.body;
  if (!channelId) return res.status(400).json({ error: "channelId is required" });

  try {
    const newId = await clearChat(channelId);
    res.json({ success: true, message: "Channel cleared", newChannelId: newId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

const { getGuildReactionRoles } = require('../../store/reactionRoles');
const { createReactionRoleMessage, deleteReactionRoleMessage } = require('../../services/reactionRoleService');

/**
 * POST /api/panel/reactionrole
 */
router.post('/reactionrole', authMiddleware, guildAuthMiddleware, async (req, res) => {
  const guildId = req.targetGuildId;
  const { channelId, content, pairs } = req.body;
  if (!channelId || !content || !pairs || !Array.isArray(pairs)) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  try {
    const result = await createReactionRoleMessage(guildId, { channelId, content, pairs });
    res.json({ success: true, messageId: result.messageId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/panel/reactionroles
 */
router.get('/reactionroles', authMiddleware, guildAuthMiddleware, (req, res) => {
  const guildId = req.targetGuildId;
  const roles = getGuildReactionRoles(guildId);
  const result = [];
  for (const [messageId, data] of roles.entries()) {
    result.push({ messageId, channelId: data.channelId, pairs: data.pairs });
  }
  res.json(result);
});

/**
 * DELETE /api/panel/reactionrole
 */
router.delete('/reactionrole', authMiddleware, guildAuthMiddleware, async (req, res) => {
  const guildId = req.targetGuildId;
  const { messageId } = req.body;
  if (!messageId) return res.status(400).json({ error: "Missing messageId" });

  try {
    await deleteReactionRoleMessage(guildId, messageId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
