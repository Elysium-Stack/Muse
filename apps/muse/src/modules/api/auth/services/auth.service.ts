import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '@prisma';
import * as argon2 from 'argon2';
import { User } from 'discord.js';
import { DiscordApiService } from '../../discord/services';
import { avatarIdToString } from '../../discord/utils/avatar-id-to-string';
import { DiscordPayload } from '../types/discord-payload.type';
import { JWT_REFRESh_SECRET, JWT_SECRET } from '../util/constants';

@Injectable()
export class AuthService extends HealthIndicator {
	constructor(
		private readonly _prisma: PrismaService,
		private readonly _jwt: JwtService,
		private readonly _discord: DiscordApiService,
	) {
		super();
	}

	async signin(payload: DiscordPayload) {
		const { id, username, discriminator, accessToken, refreshToken } =
			payload;

		const user = await this._prisma.users.upsert({
			where: {
				discordId: id,
			},
			update: {
				discordId: id,
				username,
				discriminator,
				discordToken: accessToken,
				discordRefreshToken: refreshToken,
			},
			create: {
				discordId: id,
				username,
				discriminator,
				discordToken: accessToken,
				discordRefreshToken: refreshToken,
			},
		});

		const tokens = await this._getTokens(user.id);
		await this._updateRefreshToken(user.id, tokens.refreshToken);
		return tokens;
	}

	async refreshTokens(id: number, refreshToken: string) {
		const user = await this._prisma.users.findFirst({
			where: {
				id,
			},
		});

		if (!user || !user.refreshToken) {
			throw new ForbiddenException('Access Denied');
		}

		const refreshTokenMatches = await argon2.verify(
			user.refreshToken,
			refreshToken,
		);

		if (!refreshTokenMatches) {
			throw new ForbiddenException('Access Denied');
		}

		const tokens = await this._getTokens(user.id);
		await this._updateRefreshToken(user.id, tokens.refreshToken);

		return tokens;
	}

	signout(userId: number) {
		return this._prisma.users.update({
			where: {
				id: userId,
			},
			data: {
				refreshToken: null,
			},
		});
	}

	private async _getTokens(userId: number) {
		const discordUser = await this._discord.request<User>(
			userId,
			'/users/@me',
		);

		const [accessToken, refreshToken] = await Promise.all([
			this._jwt.signAsync(
				{
					sub: userId,
					discord: {
						...discordUser,
						avatar: avatarIdToString(
							discordUser.id,
							discordUser.avatar!,
						),
					},
				},
				{
					secret: JWT_SECRET,
					expiresIn: '15m',
				},
			),
			this._jwt.signAsync(
				{
					sub: userId,
				},
				{
					secret: JWT_REFRESh_SECRET,
					expiresIn: '7d',
				},
			),
		]);

		return {
			accessToken,
			refreshToken,
		};
	}

	private async _updateRefreshToken(userId: number, refreshToken: string) {
		const hashedRefreshToken = await argon2.hash(refreshToken);
		return this._prisma.users.update({
			where: {
				id: userId,
			},
			data: {
				refreshToken: hashedRefreshToken,
			},
		});
	}
}
