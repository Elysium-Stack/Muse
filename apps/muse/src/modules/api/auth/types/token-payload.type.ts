export interface TokenPayload {
	/**
	 * Discord id of the user.
	 */
	id: string;

	/**
	 * Discord username of the user.
	 */
	username: string;

	/**
	 * Discord avatar of the user.
	 * @minLength 4
	 * @maxLength 4
	 */
	discriminator: string;
}
