import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { DiscordApiService } from '../services/api.service';

@Controller('discord/guilds')
export class GuildsController {
	constructor(private _discord: DiscordApiService) {}

	@Get()
	@UseGuards(AccessTokenGuard)
	guilds(@Request() { user: { sub } }) {
		return this._discord.request(sub, '/users/@me/guilds');
	}
}
