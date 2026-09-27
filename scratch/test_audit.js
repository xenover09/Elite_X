const { Client, GatewayIntentBits } = require('discord.js');
const { runSecurityAudit } = require('../src/services/securityAudit');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.on('ready', async () => {
  console.log('Bot ready');
  try {
    // Pick the first guild
    const guild = client.guilds.cache.first();
    if (guild) {
      console.log('Running audit for guild:', guild.name);
      const result = await runSecurityAudit(guild);
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log('No guilds found');
    }
  } catch (err) {
    console.error('Audit Error:', err);
  }
  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
