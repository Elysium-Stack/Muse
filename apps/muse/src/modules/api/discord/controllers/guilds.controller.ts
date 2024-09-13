import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Client, OAuth2Guild, PermissionsBitField } from 'discord.js';

import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { DiscordApiService } from '../services/api.service';
import { BotOAuth2GuildDTO } from '../types/guild.type';

import type { AuthenticatedRequestDTO } from '@muse/types/authenticated-request.type';

import { PrismaService, UsersEntity } from '@prisma';

@Controller('discord/guilds')
@ApiTags('Guilds')
export class GuildsController {
	constructor(
		private _discord: DiscordApiService,
		private _prisma: PrismaService,
		private _client: Client
	) {}

	/**
	 * Get the current users discord guilds
	 */
	@Get()
	@UseGuards(AccessTokenGuard)
	async guilds(
		@Request() { user: { sub } }: AuthenticatedRequestDTO
	): Promise<BotOAuth2GuildDTO[]> {
		const guilds = await this._discord.request<OAuth2Guild[]>(
			sub,
			'/users/@me/guilds'
		);
		return guilds
			.filter(g =>
				new PermissionsBitField(g['permissions_new']).has(
					PermissionsBitField.Flags.ManageGuild
				)
			)
			.map(
				guild =>
					new BotOAuth2GuildDTO(this._client.guilds.cache.has(guild.id), guild)
			);
	}
	/**
	 * This is a test
	 */
	@Get('test')
	@UseGuards(AccessTokenGuard)
	test(): Promise<UsersEntity[]> {
		return this._prisma.users.findMany();
	}
}
