const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Displays information about the server'),

  async execute(interaction) {
    try {
      const { guild } = interaction;
      if (!guild) return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });

      const owner = await guild.fetchOwner().catch(() => null);
      const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
      const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
      const rolesCount = guild.roles.cache.size;

      const embed = new EmbedBuilder()
        .setColor('#1e1e1e')
        .setTitle(guild.name)
        .setThumbnail(guild.iconURL({ dynamic: true, size: 512 }))
        .addFields(
          { name: 'Server ID', value: guild.id, inline: true },
          { name: 'Owner', value: owner ? owner.user.tag : 'Unknown', inline: true },
          { name: 'Created On', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
          { name: 'Members', value: `${guild.memberCount}`, inline: true },
          { name: 'Channels', value: `${textChannels} Text | ${voiceChannels} Voice`, inline: true },
          { name: 'Roles', value: `${rolesCount}`, inline: true },
          { name: 'Boost Level', value: `Level ${guild.premiumTier}`, inline: true }
        )
        .setFooter({ text: 'Elite X Utility' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      logger.error(`Error executing /serverinfo: ${err.message}`);
      if (!interaction.replied) {
        await interaction.reply({ content: 'An error occurred while fetching server info.', ephemeral: true }).catch(() => {});
      }
    }
  }
};
