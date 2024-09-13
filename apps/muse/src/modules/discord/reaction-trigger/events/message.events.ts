import { Injectable, Logger } from '@nestjs/common';
import { Events } from 'discord.js';
import { Context, ContextOf, On } from 'necord';

import { ReactionTriggerGeneralService } from '../services/general.service';

@Injectable()
export class ReactionTriggerMessageEvents {
	private readonly _logger = new Logger(ReactionTriggerMessageEvents.name);

	constructor(private _reactionTriggerService: ReactionTriggerGeneralService) {}

	@On(Events.MessageCreate)
	public onMessageCreate(
		@Context() [message]: ContextOf<Events.MessageCreate>
	) {
		this._reactionTriggerService.checkForReactionTriggers(message);
	}
}
