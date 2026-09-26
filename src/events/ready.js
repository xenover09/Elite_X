const { Events, ActivityType } = require('discord.js');
const logger = require('../utils/logger');
const queueService = require('../services/queueService');
const { sendPanel } = require('../services/panelService');

module.exports = {
  name: Events.ClientReady,
  once: true,

  /**
   * @param {import('discord.js').Client} client
   */
  execute(client) {
    logger.info(`Bot is online as ${client.user.tag}`);
    logger.info(`Serving ${client.guilds.cache.size} guild(s)`);

    const updatePresence = () => {
      client.user.setPresence({
        activities: [
          {
            name: `${client.guilds.cache.size} servers | /dashboard`,
            type: ActivityType.Watching,
          },
        ],
        status: 'online',
      });
    };

    updatePresence();
    // Update presence every 10 minutes in case bot joins/leaves servers
    setInterval(updatePresence, 10 * 60 * 1000);

    // --- Queue Processor ---
    // Check for pending dashboard panels every 5 seconds
    setInterval(async () => {
      const pending = queueService.fetchAndClear();
      if (pending.length === 0) return;

      logger.info(`Processing ${pending.length} pending panels from queue...`);

      for (const panel of pending) {
        try {
          await sendPanel(panel);
          logger.info(`✅ Successfully sent queued panel to channel: ${panel.channelId}`);
        } catch (err) {
          logger.error(`❌ Failed to send queued panel: ${err.message}`);
        }
      }
    }, 5000);
  },
};
