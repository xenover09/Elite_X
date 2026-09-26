const { REST, Routes } = require('discord.js');
const logger = require('./logger');

/**
 * Register commands to a specific guild.
 * @param {import('discord.js').Client} client 
 * @param {string} guildId 
 */
async function registerGuildCommands(client, guildId) {
  try {
    const commandsData = client.commands.map(cmd => cmd.data.toJSON());
    const rest = new REST().setToken(process.env.DISCORD_TOKEN);
    
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, guildId),
      { body: commandsData }
    );
    logger.info(`Successfully registered ${commandsData.length} (/) commands in guild ${guildId}.`);
  } catch (err) {
    logger.error(`Failed to register commands for guild ${guildId}: ${err.message}`);
  }
}

/**
 * Register commands to all guilds the bot is currently in.
 * @param {import('discord.js').Client} client 
 */
async function registerAllGuilds(client) {
  const guildIds = client.guilds.cache.map(g => g.id);
  logger.info(`Registering commands for ${guildIds.length} guilds...`);
  
  for (const guildId of guildIds) {
    await registerGuildCommands(client, guildId);
  }
}

module.exports = {
  registerGuildCommands,
  registerAllGuilds
};
