const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Displays the avatar of a user')
    .addUserOption(option => 
      option.setName('target')
        .setDescription('The user to get the avatar of')
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      const targetUser = interaction.options.getUser('target') || interaction.user;
      
      const avatarURL = targetUser.displayAvatarURL({ dynamic: true, size: 1024 });

      const embed = new EmbedBuilder()
        .setColor('#1e1e1e')
        .setTitle(`${targetUser.username}'s Avatar`)
        .setImage(avatarURL)
        .setFooter({ text: 'Elite X Utility' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      logger.error(`Error executing /avatar: ${err.message}`);
      if (!interaction.replied) {
        await interaction.reply({ content: 'An error occurred while fetching the avatar.', ephemeral: true }).catch(() => {});
      }
    }
  }
};
