import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { db, applicationLogsTable } from "@workspace/db";

const ALLOWED_ROLE_ID = "1487538007434203339";
const BANNER_URL =
  "https://cdn.discordapp.com/attachments/1476881730496499844/1521004306449436692/IMG_6237.png?ex=6a434125&is=6a41efa5&hm=48d07a9f0b5fcbbff1cce2ba1dabf46013d7c05b71dac45c18da8280f97cce6e&";

export const data = new SlashCommandBuilder()
  .setName("application-result")
  .setDescription("Post the result of a member's application. (Staff only)")
  .addStringOption((option) =>
    option
      .setName("name")
      .setDescription("The applicant's name")
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName("position")
      .setDescription("The position the applicant applied for")
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName("result")
      .setDescription("The result of the application")
      .setRequired(true)
      .addChoices(
        { name: "Accepted", value: "accepted" },
        { name: "Denied", value: "denied" },
      ),
  )
  .addStringOption((option) =>
    option
      .setName("reason")
      .setDescription("Reason (required if denied)")
      .setRequired(false),
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const member = await interaction.guild?.members.fetch(interaction.user.id);
  const hasRole = member?.roles.cache.has(ALLOWED_ROLE_ID);

  if (!hasRole) {
    await interaction.reply({
      content: "❌ You do not have permission to use this command.",
      ephemeral: true,
    });
    return;
  }

  const name = interaction.options.getString("name", true);
  const position = interaction.options.getString("position", true);
  const result = interaction.options.getString("result", true);
  const reason = interaction.options.getString("reason");

  if (result === "denied" && !reason) {
    await interaction.reply({
      content: "❌ A reason is required when denying an application.",
      ephemeral: true,
    });
    return;
  }

  const isAccepted = result === "accepted";

  const embed = new EmbedBuilder()
    .setColor(0x00a1de)
    .setTitle("Application Result")
    .setImage(BANNER_URL)
    .addFields(
      { name: "Applicant", value: name, inline: true },
      { name: "Position", value: position, inline: true },
      {
        name: "Result",
        value: isAccepted ? "✅ Accepted" : "❌ Denied",
        inline: true,
      },
    )
    .setTimestamp();

  if (!isAccepted && reason) {
    embed.addFields({ name: "Reason", value: reason, inline: false });
  }

  await db.insert(applicationLogsTable).values({
    applicantName: name,
    position,
    result,
    reason: reason ?? null,
    staffId: interaction.user.id,
    staffTag: interaction.user.tag,
    guildId: interaction.guildId ?? "unknown",
  });

  await interaction.reply({ embeds: [embed] });
}
