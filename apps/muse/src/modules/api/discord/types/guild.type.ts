import { OAuth2Guild } from 'discord.js';

export class BotOAuth2GuildDTO {
	/**
	 * Wether the bot has access to the guild
	 */
	available: boolean;

	/**
	 * The Discord API response for the guild
	 */
	guild: OAuth2Guild;

	constructor(available: boolean, guild: OAuth2Guild) {
		this.available = available;
		this.guild = guild;
	}
}
