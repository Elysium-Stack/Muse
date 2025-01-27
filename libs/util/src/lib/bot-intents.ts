import { GatewayIntentBits } from 'discord.js';

export const intents = [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildModeration,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.GuildMembers,
	GatewayIntentBits.GuildVoiceStates,
	GatewayIntentBits.MessageContent,
	GatewayIntentBits.GuildEmojisAndStickers,
	GatewayIntentBits.GuildMessageReactions,
];
