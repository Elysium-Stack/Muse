import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-discord';
import { DiscordPayload } from '../types/discord-payload.type';
import { AuthService } from './auth.service';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
	constructor(private readonly _auth: AuthService) {
		super({
			clientID: process.env.DISCORD_OAUTH_CLIENT_ID,
			clientSecret: process.env.DISCORD_OAUTH_CLIENT_SECRET,
			callbackURL: process.env.DISCORD_OAUTH_CALLBACK_URL,
			scope: process.env.DISCORD_OAUTH_SCOPES
				? process.env.DISCORD_OAUTH_SCOPES.split(',')
				: [],
		});
	}

	async validate(
		accessToken: string,
		refreshToken: string,
		profile: any,
		done: VerifyCallback,
	): Promise<any> {
		const { id, username, discriminator } = profile;
		const payload: DiscordPayload = {
			id,
			username,
			discriminator,
			accessToken,
			refreshToken,
		};

		const data = await this._auth.signin(payload);

		return done(null, data);
	}
}
