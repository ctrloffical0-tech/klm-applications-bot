import {
  Client,
  GatewayIntentBits,
  Events,
  ChatInputCommandInteraction,
} from "discord.js";
import { logger } from "../lib/logger.js";
import * as helpCommand from "./commands/help.js";
import * as applicationResultCommand from "./commands/application-result.js";
import * as applicationLogCommand from "./commands/application-log.js";

const commands = new Map([
  [helpCommand.data.name, helpCommand],
  [applicationResultCommand.data.name, applicationResultCommand],
  [applicationLogCommand.data.name, applicationLogCommand],
]);

export function startBot() {
  const token = process.env["DISCORD_BOT_TOKEN"];

  if (!token) {
    logger.warn("DISCORD_BOT_TOKEN not set — Discord bot will not start.");
    return;
  }

  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  client.once(Events.ClientReady, (readyClient) => {
    logger.info({ tag: readyClient.user.tag }, "Discord bot is ready");
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = commands.get(interaction.commandName);

    if (!command) {
      logger.warn({ commandName: interaction.commandName }, "Unknown command");
      return;
    }

    try {
      await command.execute(interaction as ChatInputCommandInteraction);
    } catch (err) {
      logger.error({ err, commandName: interaction.commandName }, "Command error");
      const errorPayload = {
        content: "An error occurred while running this command.",
        ephemeral: true,
      };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorPayload);
      } else {
        await interaction.reply(errorPayload);
      }
    }
  });

  client.login(token).catch((err) => {
    logger.error({ err }, "Failed to log in to Discord");
  });
}
