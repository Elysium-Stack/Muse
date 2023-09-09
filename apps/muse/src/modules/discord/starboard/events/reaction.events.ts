import { Injectable, Logger } from '@nestjs/common';
import { Events } from 'discord.js';
import { Context, ContextOf, On } from 'necord';
import { StarboardGeneralService } from '../services/general.service';

@Injectable()
export class StarboardReactionEvents {
	private readonly _logger = new Logger(StarboardReactionEvents.name);

	constructor(private _general: StarboardGeneralService) {}

	@On(Events.MessageReactionAdd)
	public async onReactionAdd(
		@Context() [reaction]: ContextOf<Events.MessageReactionAdd>,
	) {
		try {
			reaction = await reaction.fetch();
		} catch (error) {
			return;
		}

		this._general.checkReaction(reaction);
	}

	@On(Events.MessageReactionRemove)
	public async onReactionRemove(
		@Context() [reaction]: ContextOf<Events.MessageReactionRemove>,
	) {
		try {
			reaction = await reaction.fetch();
		} catch (error) {
			return;
		}

		this._general.checkReaction(reaction);
	}
}
