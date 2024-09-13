/* tslint:disable */
/* eslint-disable */

export interface WhoamiDiscordResponseDto {
	/**
	 * Discord accent color of the user.
	 */
	accent_color: string;

	/**
	 * Discord avatar of the user, forrmatted to an url.
	 */
	avatar: string;

	/**
	 * Discord avatar decoration of the user, forrmatted to an url.
	 */
	avatar_decoration: null | string;

	/**
	 * Discord banner of the user, forrmatted to an url.
	 */
	banner: null | string;

	/**
	 * Discord banner color of the user.
	 */
	banner_color: string;

	/**
	 * Discord avatar of the user.
	 */
	discriminator: string;

	/**
	 * Discord's flags of the user.
	 */
	flags: number;

	/**
	 * Discord's global_name of the user.
	 */
	global_name: null | string;

	/**
	 * Discord id of the user.
	 */
	id: string;

	/**
	 * Discord locale of the user.
	 */
	locale: string;

	/**
	 * Wether the user has mfa enabled on discord.
	 */
	mfa_enabled: boolean;

	/**
	 * Discord premium type of the user.
	 */
	premium_type: number;

	/**
	 * Discord's public flags of the user.
	 */
	public_flags: number;

	/**
	 * Discord username of the user.
	 */
	username: string;
}
