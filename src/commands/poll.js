const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const logger = require('../utils/logger');

// Emojis for poll options (1 to 5)
const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a quick poll with up to 5 options')
    .addStringOption(option => 
      option.setName('question')
      .setDescription('The question to ask')
      .setRequired(true)
      .setMaxLength(256)
    )
    .addStringOption(option =>
      option.setName('options')
      .setDescription('Comma-separated options (e.g., Yes, No, Maybe)')
      .setRequired(true)
      .setMaxLength(500)
    ),

  async execute(interaction) {
    try {
      const rawQuestion = interaction.options.getString('question');
      const rawOptions = interaction.options.getString('options');

      // Strip @everyone and @here to prevent mention abuse
      const question = rawQuestion.replace(/@(everyone|here)/ig, '@\u200B$1');
      const optionsArr = rawOptions.split(',').map(o => o.trim().replace(/@(everyone|here)/ig, '@\u200B$1')).filter(o => o.length > 0);

      if (optionsArr.length < 2 || optionsArr.length > 5) {
        return interaction.reply({ 
          content: 'Please provide between 2 and 5 options, separated by commas.', 
          ephemeral: true 
        });
      }

      let description = '';
      for (let i = 0; i < optionsArr.length; i++) {
        description += `${numberEmojis[i]} ${optionsArr[i]}\n\n`;
      }

      const embed = new EmbedBuilder()
        .setColor('#d4af37')
        .setTitle(`📊 ${question}`)
        .setDescription(description)
        .setFooter({ text: `Poll by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
        .setTimestamp();

      const message = await interaction.reply({ embeds: [embed], fetchReply: true });

      // Add reactions
      for (let i = 0; i < optionsArr.length; i++) {
        await message.react(numberEmojis[i]).catch(() => {});
      }
    } catch (err) {
      logger.error(`Error executing /poll: ${err.message}`);
      if (!interaction.replied) {
        await interaction.reply({ content: 'An error occurred while creating the poll.', ephemeral: true }).catch(() => {});
      }
    }
  }
};
