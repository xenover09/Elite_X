require('dotenv').config();

const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const { loadCommands } = require('./handlers/commandHandler');
const { loadEvents } = require('./handlers/eventHandler');
const { startDashboard } = require('./dashboard/server');
const { init: initPanelService } = require('./services/panelService');
const { initReactionRoleService } = require('./services/reactionRoleService');
const logger = require('./utils/logger');

// Validate required environment variables
const requiredEnvVars = [
  'DISCORD_TOKEN',
  'CLIENT_ID',
  'GROQ_API_KEY',
  'ADMIN_KEY'
];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    logger.error(`[STARTUP ERROR] Missing environment variable: ${envVar}`);
    // We intentionally DO NOT exit here anymore so the dashboard stays online
    // to allow the user to debug OAuth and fix the environment variable.
  }
}

// Initialize Discord Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Reaction, Partials.User],
});
// Attach collections to client
client.commands = new Collection();
client.cooldowns = new Collection();

// Load handlers
loadCommands(client);
loadEvents(client);

// Give services access to the Discord client
initPanelService(client);
initReactionRoleService(client);

// Start the bot and dashboard asynchronously
async function start() {
  await require('./store/persistentStore').loadAllData();
  
  startDashboard(client);
  
  client.login(process.env.DISCORD_TOKEN).catch((err) => {
    logger.error('❌ Failed to login to Discord. Check your DISCORD_TOKEN on Railway!');
    logger.error(`Error details: ${err.message}`);
    logger.warn('⚠️ Bot is offline, but the dashboard server will remain active.');
  });
}

start();

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err.stack || err.message);
  logger.warn('⚠️ Caught exception but preventing process exit to keep dashboard online.');
});
