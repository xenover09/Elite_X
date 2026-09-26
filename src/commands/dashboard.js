const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dashboard')
    .setDescription('Get the link to the Elite X Web Dashboard'),
    
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🌐 Elite X Dashboard')
      .setDescription('Click the button below to open the Web Dashboard and manage the bot, configure AI settings, and send embeds!')
      .setColor('#3b82f6')
      .setThumbnail(interaction.client.user.displayAvatarURL());

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('Open Dashboard')
          .setURL('https://elitex-production.up.railway.app/')
          .setStyle(ButtonStyle.Link)
      );

    await interaction.reply({
      embeds: [embed],
      components: [row]
    });
  }
};
