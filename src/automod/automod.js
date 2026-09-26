'use strict';

const logger = require('../utils/logger');
const badwords = require('./badwords');
const { getState } = require('../store/panelState');

/**
 * In-memory sliding window for spam detection.
 * Key: userId, Value: Array of timestamps of recent messages.
 */
const userMessageHistory = new Map();

/**
 * Perform action: Delete message and timeout user for 60 seconds.
 */
async function takeAction(message, reason) {
  try {
    // 1. Log the action
    logger.warn(`[AutoMod] Triggered for ${message.author.tag} in guild "${message.guild.name}". Reason: ${reason}`);

    // 2. Delete message if we have permission
    if (message.deletable) {
      await message.delete().catch(() => {});
    }

    // 3. Timeout user for 60s if we have permission
    if (message.member && message.member.moderatable) {
      await message.member.timeout(60 * 1000, `AutoMod: ${reason}`).catch(() => {});
    } else {
      logger.info(`[AutoMod] Could not timeout ${message.author.tag} in ${message.guild.name} (Missing permissions or hierarchy).`);
    }
  } catch (err) {
    logger.error(`[AutoMod] Error executing action on ${message.author.tag}`, err.message);
  }
}

/**
 * Run AutoMod checks on a message.
 * @param {import('discord.js').Message} message 
 */
async function check(message) {
  // Ignore system messages, bot messages, or DMs
  if (!message.guild || message.author.bot || message.system) return;

  // Exempt users with Manage Messages or Admin (moderators/admins)
  if (message.member && message.member.permissions.has('ManageMessages')) return;

  const guildId = message.guild.id;
  const state = getState(guildId);
  const content = message.content;

  // 1. Check Invites (discord.gg or discordapp.com/invite)
  if (state.amInvites) {
    const inviteRegex = /(discord\.gg|discordapp\.com\/invite|discord\.com\/invite)\/[a-zA-Z0-9]+/i;
    if (inviteRegex.test(content)) {
      await takeAction(message, 'Posted a Discord invite link.');
      return true; // Stop processing other rules
    }
  }

  // 2. Check Bad Words
  if (state.amBadwords && content) {
    const contentLower = content.toLowerCase();
    for (const word of badwords) {
      // Very basic substring match (could be improved to word boundary)
      // We will use word boundary for better accuracy:
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(contentLower)) {
        await takeAction(message, 'Used inappropriate language.');
        return true;
      }
    }
  }

  // 3. Check Excessive Caps (10+ chars, 70%+ caps)
  if (state.amCaps && content.length > 10) {
    const letters = content.replace(/[^a-zA-Z]/g, '');
    if (letters.length > 10) {
      const caps = letters.replace(/[^A-Z]/g, '').length;
      if (caps / letters.length > 0.7) {
        await takeAction(message, 'Excessive use of capital letters.');
        return true;
      }
    }
  }

  // 4. Check Excessive Mentions (5+ mentions)
  if (state.amMentions) {
    // message.mentions.users only counts unique users, which is usually fine,
    // but a user could mention the same person 10 times.
    const mentionMatches = content.match(/<@!?\d+>/g);
    const mentionCount = mentionMatches ? mentionMatches.length : 0;
    
    if (mentionCount >= 5) {
      await takeAction(message, 'Excessive mentions (spam).');
      return true;
    }
  }

  // 5. Check Spam (5 messages in 5 seconds)
  if (state.amSpam) {
    const userId = message.author.id;
    const now = Date.now();
    let history = userMessageHistory.get(userId) || [];
    
    // Filter history to only include messages from the last 5 seconds
    history = history.filter(time => now - time < 5000);
    history.push(now);
    userMessageHistory.set(userId, history);

    if (history.length >= 5) {
      await takeAction(message, 'Message spam (5+ messages in 5 seconds).');
      // Clear history so they don't instantly trigger it again right after timeout expires
      userMessageHistory.delete(userId);
      return true;
    }
  }

  return false;
}

module.exports = { check };
