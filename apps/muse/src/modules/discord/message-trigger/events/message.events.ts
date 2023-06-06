import { Injectable, Logger } from '@nestjs/common';
import { Events } from 'discord.js';
import { Context, ContextOf, On } from 'necord';
import { MessageTriggerGeneralService } from '../services/general.service';

@Injectable()
export class MessageTriggerMessageEvents {
	private readonly _logger = new Logger(MessageTriggerMessageEvents.name);

	constructor(private _messageTriggerService: MessageTriggerGeneralService) {}

	@On(Events.MessageCreate)
	public onMessageCreate(
		@Context() [message]: ContextOf<Events.MessageCreate>,
	) {
		this._messageTriggerService.checkForMessageTriggers(message);
	}
}
