const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Displays a list of all available commands.'),

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction 
   */
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🛠️ Elite X Help Menu')
      .setDescription('Here are the available commands you can use with Elite X:')
      .setColor('#22c55e') // Parrot green accent
      .addFields(
        { name: '🤖 AI & Chat', value: '`/ask` - Ask the AI a question (Groq powered)' },
        { name: '⚙️ Utilities', value: '`/poll` - Create a reaction-based poll\n`/avatar` - View a user\'s avatar\n`/serverinfo` - Display information about the server\n`/userinfo` - Display information about a user' },
        { name: '🛡️ Moderation & Management', value: '`/panel` - Open the moderation panel\n`/dashboard` - Get a link to the web dashboard' }
      )
      .setFooter({ text: 'Elite X Bot - Your Server Assistant' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
