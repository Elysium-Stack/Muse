export class TokensResponseDTO {
	/**
	 * The users's access token.
	 */
	accessToken: string;

	/**
	 * The users's refresh token.
	 */
	refreshToken: string;
}

export class WhoamiDiscordResponseDTO {
	/**
	 * Discord id of the user.
	 */
	id: string;

	/**
	 * Discord username of the user.
	 */
	username: string;

	/**
	 * Discord's global_name of the user.
	 */
	global_name: string | null;

	/**
	 * Discord avatar of the user, forrmatted to an url.
	 */
	avatar: string;

	/**
	 * Discord avatar of the user.
	 * @minLength 4
	 * @maxLength 4
	 */
	discriminator: string;

	/**
	 * Discord's public flags of the user.
	 */
	public_flags: number;

	/**
	 * Discord's flags of the user.
	 */
	flags: number;

	/**
	 * Discord banner of the user, forrmatted to an url.
	 */
	banner: string | null;

	/**
	 * Discord banner color of the user.
	 */
	banner_color: string;

	/**
	 * Discord accent color of the user.
	 */
	accent_color: string;

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
	 * Discord avatar decoration of the user, forrmatted to an url.
	 */
	avatar_decoration: string | null;
}

export class TokenResponseDTO {
	/**
	 * The user's access token.
	 */
	accessToken?: string;

	/**
	 * The user's refresh token.
	 */
	refreshToken?: string;
}

export class ParsedTokenResponseDTO extends TokenResponseDTO {
	/**
	 * ID of the user.
	 */
	sub: number;

	/**
	 * The discord user of the user.
	 */
	discord: WhoamiDiscordResponseDTO;

	/**
	 * Time of issuing the access token.
	 */
	iat: number;

	/**
	 * Experation time of the access token.
	 */
	exp: number;
}
