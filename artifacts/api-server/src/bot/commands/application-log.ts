import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { db, applicationLogsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";

const ALLOWED_ROLE_ID = "1487538007434203339";

export const data = new SlashCommandBuilder()
  .setName("application-log")
  .setDescription("View past application results. (Staff only)")
  .addIntegerOption((option) =>
    option
      .setName("limit")
      .setDescription("How many results to show (default: 10, max: 25)")
      .setRequired(false)
      .setMinValue(1)
      .setMaxValue(25),
  )
  .addStringOption((option) =>
    option
      .setName("filter")
      .setDescription("Filter by result type")
      .setRequired(false)
      .addChoices(
        { name: "All", value: "all" },
        { name: "Accepted only", value: "accepted" },
        { name: "Denied only", value: "denied" },
      ),
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

  await interaction.deferReply({ ephemeral: true });

  const limit = interaction.options.getInteger("limit") ?? 10;
  const filter = interaction.options.getString("filter") ?? "all";

  const query = db
    .select()
    .from(applicationLogsTable)
    .orderBy(desc(applicationLogsTable.createdAt))
    .limit(limit);

  const rows =
    filter === "all"
      ? await query
      : await db
          .select()
          .from(applicationLogsTable)
          .where(eq(applicationLogsTable.result, filter))
          .orderBy(desc(applicationLogsTable.createdAt))
          .limit(limit);

  if (rows.length === 0) {
    await interaction.editReply({
      content: "No application results found.",
    });
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(0x00a1de)
    .setTitle(
      `Application Log${filter !== "all" ? ` — ${filter.charAt(0).toUpperCase() + filter.slice(1)}` : ""}`,
    )
    .setDescription(`Showing the last **${rows.length}** result(s).`)
    .setTimestamp();

  for (const row of rows) {
    const date = new Date(row.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const resultIcon = row.result === "accepted" ? "✅" : "❌";
    const value = [
      `**Position:** ${row.position}`,
      `**Result:** ${resultIcon} ${row.result.charAt(0).toUpperCase() + row.result.slice(1)}`,
      row.reason ? `**Reason:** ${row.reason}` : null,
      `**Staff:** <@${row.staffId}>`,
      `**Date:** ${date}`,
    ]
      .filter(Boolean)
      .join("\n");

    embed.addFields({ name: row.applicantName, value, inline: false });
  }

  await interaction.editReply({ embeds: [embed] });
}
