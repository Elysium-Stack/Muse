import { HttpService } from '@nestjs/axios';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma';
import { AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';
import { DISCORD_API_URL } from '../utils/constants';

@Injectable()
export class DiscordApiService {
	constructor(
		private readonly _http: HttpService,
		private readonly _prisma: PrismaService,
	) {}

	async request<T>(
		userId: number,
		request: AxiosRequestConfig | string,
	): Promise<T> {
		const { accessToken, refreshToken } = await this._getTokens(userId);

		let url: string = '';
		let config: AxiosRequestConfig = {};

		if (typeof request === 'string') {
			url = request as string;
			config = {} as AxiosRequestConfig;
		}

		if (request instanceof Object) {
			url = request.url ?? '';
			config = request;
		}

		const { status, data } = await firstValueFrom(
			this._http.request({
				...(config ?? {}),
				url: `${DISCORD_API_URL}${url}`,
				responseType: 'json',
				headers: {
					...(config.headers ?? {}),
					Authorization: `Bearer ${accessToken}`,
					Accept: 'application/json',
				},
			}),
		).catch((e) => this._handleFourOhOne(e));

		if (status === 401) {
			await this._refreshTokens(userId, refreshToken);
			return this.request(userId, { url, ...config });
		}

		return data;
	}

	private async _getTokens(userId: number) {
		const user = await this._prisma.users.findFirst({
			where: {
				id: userId,
			},
		});

		if (!user) {
			throw new ForbiddenException('Access Denied');
		}

		return {
			accessToken: user.discordToken,
			refreshToken: user.discordRefreshToken,
		};
	}

	private async _refreshTokens(userId: number, refreshToken: string) {
		const formData = new FormData();
		formData.append('client_id', process.env.DISCORD_OAUTH_CLIENT_ID!);
		formData.append(
			'client_secret',
			process.env.DISCORD_OAUTH_CLIENT_SECRET!,
		);
		formData.append('refresh_token', refreshToken);
		formData.append('grant_type', 'refresh_token');

		const { status, data } = await firstValueFrom(
			this._http.request({
				method: 'POST',
				url: `${DISCORD_API_URL}/oauth2/token`,
				responseType: 'json',
				headers: { 'Content-Type': 'multipart/form-data' },
				data: formData,
			}),
		).catch((e) => this._handleFourOhOne(e));

		if (status === 401) {
			throw new ForbiddenException('Access Denied');
		}

		return this._prisma.users.update({
			where: {
				id: userId,
			},
			data: {
				discordToken: data.access_token,
				discordRefreshToken: data.refresh_token,
			},
		});
	}

	private _handleFourOhOne(e: any) {
		if (e.response.status === 401) {
			return {
				status: 401,
				data: null,
			};
		}

		throw e;
	}
}
