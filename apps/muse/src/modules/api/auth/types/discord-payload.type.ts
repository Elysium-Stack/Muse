export interface DiscordPayload {
	/**
	 * Primary Key.
	 */
	id: string;

	/**
	 * The discord username.
	 */
	username: string;

	/**
	 * The discord discriminator.
	 */
	discriminator: string;

	/**
	 * The discord access token.
	 */
	accessToken: string;

	/**
	 * The discord refresh token.
	 */
	refreshToken: string;
}
