const { Events } = require('discord.js');
const logger = require('../utils/logger');
const { registerGuildCommands } = require('../utils/slashRegister');

module.exports = {
  name: Events.GuildCreate,
  async execute(guild) {
    logger.info(`Joined new guild: ${guild.name} (${guild.id})`);
    
    // Register commands for this new guild immediately
    await registerGuildCommands(guild.client, guild.id);
  },
};
