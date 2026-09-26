const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Displays information about a user')
    .addUserOption(option => 
      option.setName('target')
        .setDescription('The user to get info about')
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      const targetUser = interaction.options.getUser('target') || interaction.user;
      const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

      const embed = new EmbedBuilder()
        .setColor('#1e1e1e')
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 512 }))
        .setTitle(targetUser.tag)
        .addFields(
          { name: 'User ID', value: targetUser.id, inline: true },
          { name: 'Account Created', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:D>`, inline: true }
        );

      if (targetMember) {
        embed.addFields({ name: 'Joined Server', value: `<t:${Math.floor(targetMember.joinedTimestamp / 1000)}:D>`, inline: true });
        
        // Filter @everyone out and map the rest
        const roles = targetMember.roles.cache
          .filter(r => r.id !== interaction.guild.id)
          .sort((a, b) => b.position - a.position)
          .map(r => r.toString())
          .join(', ');
        
        if (roles) {
          embed.addFields({ name: `Roles [${targetMember.roles.cache.size - 1}]`, value: roles.substring(0, 1024) });
        }
      }

      embed.setFooter({ text: 'Elite X Utility' }).setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      logger.error(`Error executing /userinfo: ${err.message}`);
      if (!interaction.replied) {
        await interaction.reply({ content: 'An error occurred while fetching user info.', ephemeral: true }).catch(() => {});
      }
    }
  }
};
