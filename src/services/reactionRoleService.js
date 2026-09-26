const { getGuildReactionRoles, addReactionRole, removeReactionRole } = require('../store/reactionRoles');
const logger = require('../utils/logger');

let clientInstance = null;

function initReactionRoleService(client) {
  clientInstance = client;
}

/**
 * Creates a reaction role message in the specified channel.
 * @param {string} guildId 
 * @param {Object} data 
 * @param {string} data.channelId
 * @param {string} data.content
 * @param {Array<{emoji: string, roleId: string}>} data.pairs
 */
async function createReactionRoleMessage(guildId, data) {
  if (!clientInstance) throw new Error('Discord client not initialized.');
  const { channelId, content, pairs } = data;

  const guild = clientInstance.guilds.cache.get(guildId);
  if (!guild) throw new Error('Guild not found.');

  const channel = guild.channels.cache.get(channelId);
  if (!channel || channel.type !== 0) throw new Error('Invalid text channel.');

  // Check roles exist and bot has higher role
  const botMember = await guild.members.fetch(clientInstance.user.id).catch(() => null);
  if (!botMember) throw new Error('Bot is not in the server.');

  const botHighestRole = botMember.roles.highest.position;

  for (const pair of pairs) {
    const role = guild.roles.cache.get(pair.roleId);
    if (!role) throw new Error(`Role ${pair.roleId} does not exist.`);
    if (role.position >= botHighestRole) {
      throw new Error(`Bot cannot assign the role "${role.name}" because it is equal to or higher than the bot's highest role.`);
    }
  }

  // Send message
  const message = await channel.send({ content }).catch(err => {
    throw new Error(`Failed to send message: ${err.message}`);
  });

  // React with emojis
  for (const pair of pairs) {
    try {
      await message.react(pair.emoji);
    } catch (err) {
      // If one emoji fails, we try to proceed, but log it
      logger.warn(`Failed to react with ${pair.emoji}: ${err.message}`);
    }
  }

  // Save to store
  addReactionRole(guildId, message.id, channelId, pairs);

  return { messageId: message.id, channelId };
}

/**
 * Deletes a reaction role mapping and optionally the message.
 */
async function deleteReactionRoleMessage(guildId, messageId) {
  if (!clientInstance) throw new Error('Discord client not initialized.');
  
  const guildRoles = getGuildReactionRoles(guildId);
  const mapping = guildRoles.get(messageId);
  
  if (!mapping) throw new Error('Reaction role mapping not found.');
  
  removeReactionRole(guildId, messageId);

  try {
    const guild = clientInstance.guilds.cache.get(guildId);
    if (guild) {
      const channel = guild.channels.cache.get(mapping.channelId);
      if (channel) {
        const message = await channel.messages.fetch(messageId).catch(() => null);
        if (message && message.deletable) {
          await message.delete().catch(() => {});
        }
      }
    }
  } catch (err) {
    logger.warn(`Could not delete reaction role message ${messageId}: ${err.message}`);
  }

  return true;
}

module.exports = {
  initReactionRoleService,
  createReactionRoleMessage,
  deleteReactionRoleMessage
};
