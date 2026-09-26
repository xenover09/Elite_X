const { Events } = require('discord.js');
const logger = require('../utils/logger');
const { getReactionRole } = require('../store/reactionRoles');

module.exports = {
  name: Events.MessageReactionRemove,
  async execute(reaction, user) {
    if (user.bot) return;

    // Handle partials
    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch (err) {
        logger.error(`Could not fetch partial reaction: ${err.message}`);
        return;
      }
    }
    
    if (reaction.message.partial) {
      try {
        await reaction.message.fetch();
      } catch (err) {
        logger.error(`Could not fetch partial reaction message: ${err.message}`);
        return;
      }
    }

    const { message } = reaction;
    if (!message.guild) return;

    // Check mapping
    const mapping = getReactionRole(message.guild.id, message.id);
    if (!mapping) return;

    // Determine emoji string (could be unicode or name)
    const emojiStr = reaction.emoji.id ? `<:${reaction.emoji.name}:${reaction.emoji.id}>` : reaction.emoji.name;
    const pair = mapping.pairs.find(p => p.emoji === reaction.emoji.name || p.emoji === emojiStr);
    
    if (pair) {
      try {
        const member = await message.guild.members.fetch(user.id).catch(() => null);
        if (member) {
          await member.roles.remove(pair.roleId);
        }
      } catch (err) {
        logger.warn(`Could not remove reaction role from ${user.tag}: ${err.message}`);
      }
    }
  }
};
