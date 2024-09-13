import { Injectable, Logger } from '@nestjs/common';
import { Events } from 'discord.js';
import { Context, ContextOf, On } from 'necord';

import { MinecraftGeneralService } from '../services/general.service';

@Injectable()
export class MinecraftMessageEvents {
	private readonly _logger = new Logger(MinecraftMessageEvents.name);

	constructor(private _general: MinecraftGeneralService) {}

	@On(Events.MessageCreate)
	public onMessageCreate(
		@Context() [message]: ContextOf<Events.MessageCreate>,
	) {
		return;
		//this._general.sendMessage(message);
	}
}
