/* tslint:disable */
/* eslint-disable */

import { OAuth2Guild } from './o-auth-2-guild';
export interface BotOAuth2GuildDto {
	/**
	 * Wether the bot has access to the guild
	 */
	available: boolean;

	/**
	 * The Discord API response for the guild
	 */
	guild: OAuth2Guild;
}
