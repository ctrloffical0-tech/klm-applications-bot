import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Shows a list of available commands and how to use them.");

export async function execute(interaction: ChatInputCommandInteraction) {
  const embed = new EmbedBuilder()
    .setColor(0x00a1de)
    .setTitle("Help — Available Commands")
    .setDescription("Here are the commands you can use:")
    .addFields(
      {
        name: "/help",
        value: "Shows this help message with all available commands.",
        inline: false,
      },
      {
        name: "/application-result",
        value:
          "Post an application result for a member. Restricted to authorized staff.",
        inline: false,
      },
    )
    .setTimestamp()
    .setFooter({ text: "Use slash commands to interact with me." });

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
