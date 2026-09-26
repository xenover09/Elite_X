const { EmbedBuilder } = require('discord.js');
const logger = require('../utils/logger');
const { getState } = require('../store/panelState');

/**
 * Sends a clean embed log to the configured Mod Log channel.
 * @param {import('discord.js').Guild} guild 
 * @param {Object} data 
 * @param {string} data.action - e.g., 'Message Deleted (AutoMod)', 'Channel Locked'
 * @param {string} [data.target] - Who/what was acted upon (User ID/mention or Channel)
 * @param {string} [data.moderator] - Who took the action (System/AutoMod or Admin)
 * @param {string} [data.reason] - Reason for the action
 * @param {number|string} [data.color] - Embed color (e.g. 0xd4af37 or '#d4af37')
 */
async function sendModLog(guild, { action, target, moderator, reason, color = '#d4af37' }) {
  try {
    const state = getState(guild.id);
    if (!state.modLogEnabled || !state.modLogChannelId) return;

    const channel = guild.channels.cache.get(state.modLogChannelId);
    if (!channel || channel.type !== 0) return;

    // Check permissions before sending
    const botMember = await guild.members.fetch(guild.client.user.id).catch(() => null);
    if (!botMember) return;
    
    const permissions = channel.permissionsFor(botMember);
    if (!permissions.has('SendMessages') || !permissions.has('EmbedLinks')) {
      logger.warn(`Missing permissions to send mod logs in ${channel.name} (${guild.name}).`);
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`Mod Log: ${action}`)
      .setTimestamp();

    if (target) embed.addFields({ name: 'Target', value: target, inline: true });
    if (moderator) embed.addFields({ name: 'Moderator', value: moderator, inline: true });
    if (reason) embed.addFields({ name: 'Reason', value: reason, inline: false });

    await channel.send({ embeds: [embed] }).catch(() => {});
  } catch (err) {
    logger.error(`Error sending mod log: ${err.message}`);
  }
}

module.exports = { sendModLog };
