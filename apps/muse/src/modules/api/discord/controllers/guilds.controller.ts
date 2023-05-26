import { PrismaService, Users } from '@muse/modules/prisma';
import type { AuthenticatedRequest } from '@muse/types/authenticated-request.type';
import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Guild } from 'discord.js';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { DiscordApiService } from '../services/api.service';

@Controller('discord/guilds')
@ApiTags('Guilds')
export class GuildsController {
	constructor(
		private _discord: DiscordApiService,
		private _prisma: PrismaService,
	) {}

	/**
	 * Get the current users discord guilds
	 */
	@Get()
	@UseGuards(AccessTokenGuard)
	guilds(
		@Request() { user: { sub } }: AuthenticatedRequest,
	): Promise<Guild[]> {
		return this._discord.request<Guild[]>(sub, '/users/@me/guilds');
	}
	/**
	 * This is a test
	 */
	@Get('test')
	@UseGuards(AccessTokenGuard)
	test(): Promise<Users[]> {
		return this._prisma.users.findMany();
	}
}
