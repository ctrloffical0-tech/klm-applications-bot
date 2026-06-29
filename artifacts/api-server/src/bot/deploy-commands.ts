import { REST, Routes } from "discord.js";
import { data as helpData } from "./commands/help.js";
import { data as applicationResultData } from "./commands/application-result.js";
import { data as applicationLogData } from "./commands/application-log.js";

const token = process.env["DISCORD_BOT_TOKEN"];
const clientId = process.env["DISCORD_CLIENT_ID"];
const guildId = process.env["DISCORD_GUILD_ID"];

if (!token || !clientId) {
  throw new Error(
    "DISCORD_BOT_TOKEN and DISCORD_CLIENT_ID are required to deploy commands.",
  );
}

const commands = [helpData.toJSON(), applicationResultData.toJSON(), applicationLogData.toJSON()];

const rest = new REST().setToken(token);

async function deploy() {
  try {
    console.log("Registering slash commands...");

    if (guildId) {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: commands,
      });
      console.log(`✅ Registered ${commands.length} guild commands to ${guildId}`);
    } else {
      await rest.put(Routes.applicationCommands(clientId), {
        body: commands,
      });
      console.log(`✅ Registered ${commands.length} global commands`);
    }
  } catch (err) {
    console.error("Failed to register commands:", err);
    process.exit(1);
  }
}

deploy();
