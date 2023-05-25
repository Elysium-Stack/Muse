import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Guild } from 'discord.js';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { DiscordApiService } from '../services/api.service';

@Controller('discord/guilds')
@ApiTags('Guilds')
export class GuildsController {
	constructor(private _discord: DiscordApiService) {}

	@Get()
	@ApiOperation({
		summary: "Retrieve the current user's guilds",
	})
	@ApiResponse({
		status: 200,
		description: 'The guilds',
		type: Array<Guild>,
	})
	@UseGuards(AccessTokenGuard)
	guilds(@Request() { user: { sub } }): Promise<Guild[]> {
		return this._discord.request(sub, '/users/@me/guilds');
	}
}
