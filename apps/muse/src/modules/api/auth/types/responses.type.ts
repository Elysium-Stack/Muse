import { ApiProperty } from '@nestjs/swagger';

export class TokensResponse {
	@ApiProperty({
		type: String,
		description: 'This is a required property',
	})
	accessToken: string;

	@ApiProperty({
		type: String,
		description: 'This is a required property',
	})
	refreshToken: string;
}

export class WhoamiDiscordResponse {
	@ApiProperty({
		type: String,
		required: true,
	})
	id: string;

	@ApiProperty({
		type: String,
		required: true,
	})
	username: string;

	@ApiProperty({
		type: String,
		required: false,
	})
	global_name: string | null;

	@ApiProperty({
		type: String,
		required: true,
	})
	avatar: string;

	@ApiProperty({
		type: String,
		required: true,
	})
	discriminator: string;

	@ApiProperty({
		type: Number,
		required: true,
	})
	public_flags: number;

	@ApiProperty({
		type: Number,
		required: true,
	})
	flags: number;

	@ApiProperty({
		type: String,
		required: false,
	})
	banner: string | null;

	@ApiProperty({
		type: String,
		required: true,
	})
	banner_color: string;

	@ApiProperty({
		type: String,
		required: true,
	})
	accent_color: string;

	@ApiProperty({
		type: String,
		required: true,
	})
	locale: string;

	@ApiProperty({
		type: Boolean,
		required: true,
	})
	mfa_enabled: boolean;

	@ApiProperty({
		type: Number,
		required: true,
	})
	premium_type: number;

	@ApiProperty({
		type: String,
		required: false,
	})
	avatar_decoration: string | null;
}

export class WhoamiResponse {
	@ApiProperty({
		type: Number,
		required: true,
	})
	sub: number;

	@ApiProperty({
		type: WhoamiDiscordResponse,
		required: true,
	})
	discord: WhoamiDiscordResponse;

	@ApiProperty({
		type: Number,
		required: true,
	})
	iat: number;

	@ApiProperty({
		type: Number,
		required: true,
	})
	exp: number;
}
