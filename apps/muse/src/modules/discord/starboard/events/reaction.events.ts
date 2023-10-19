import { Injectable, Logger } from '@nestjs/common';
import { Events, MessageReaction, PartialMessageReaction } from 'discord.js';
import { Context, ContextOf, On } from 'necord';
import { StarboardGeneralService } from '../services/general.service';

@Injectable()
export class StarboardReactionEvents {
	private readonly _logger = new Logger(StarboardReactionEvents.name);

	private _debounceMap = new Map<string, NodeJS.Timer>();

	constructor(private _general: StarboardGeneralService) {}

	@On(Events.MessageReactionAdd)
	public onReactionAdd(
		@Context() [reaction]: ContextOf<Events.MessageReactionAdd>,
	) {
		this._checkDebounce(reaction);
	}

	@On(Events.MessageReactionRemove)
	public onReactionRemove(
		@Context() [reaction]: ContextOf<Events.MessageReactionRemove>,
	) {
		this._checkDebounce(reaction);
	}

	private _checkDebounce(reaction: MessageReaction | PartialMessageReaction) {
		this._clearTimer(reaction.message.id);

		const timer = setTimeout(() => {
			this._clearTimer(reaction.message.id);
			this._runCheck(reaction);
		}, 500);
		this._debounceMap.set(reaction.message.id, timer);
	}

	private async _runCheck(
		reaction: MessageReaction | PartialMessageReaction,
	) {
		try {
			reaction = await reaction.fetch();
		} catch (error) {
			return;
		}

		this._general.checkReaction(reaction);
	}

	private _clearTimer(messageId: string) {
		const existingTimer = this._debounceMap.get(messageId);
		if (existingTimer) {
			clearTimeout(existingTimer);
			this._debounceMap.delete(messageId);
		}
	}
}
