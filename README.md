# KLM Applications Bot

A Discord bot for managing staff applications with slash commands.

## Commands

| Command | Description | Restricted |
|---|---|---|
| `/help` | Shows all available commands | No |
| `/application-result` | Post an application result (accepted/denied) | Staff only |
| `/application-log` | View past application decisions | Staff only |

## Setup

### 1. Install dependencies
```bash
pnpm install
```

### 2. Environment variables
Create a `.env` file or set these secrets:
```
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_application_id
DISCORD_GUILD_ID=your_server_id
DATABASE_URL=your_postgres_url
```

### 3. Register slash commands
```bash
pnpm --filter @workspace/api-server tsx src/bot/deploy-commands.ts
```

### 4. Run the bot
```bash
pnpm --filter @workspace/api-server run dev
```

## Tech Stack
- **discord.js** — Discord API
- **Drizzle ORM + PostgreSQL** — Application log storage
- **Express** — HTTP server
- **TypeScript** — Type safety
- **pnpm workspaces** — Monorepo

