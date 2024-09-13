import { Injectable, Logger } from '@nestjs/common';
import { Events, Message } from 'discord.js';
import { Context, ContextOf, On } from 'necord';

import {
	TABLE_FLIP_RECOGNIZERS,
	TABLE_FLIP_RESPONSES,
} from '../util/constants';

@Injectable()
export class FunMessageEvents {
	private readonly _logger = new Logger(FunMessageEvents.name);

	@On(Events.MessageCreate)
	public onMessageCreate(
		@Context() [message]: ContextOf<Events.MessageCreate>
	) {
		this._checkTableFlip(message);
	}

	private _checkTableFlip(message: Message) {
		for (const check of TABLE_FLIP_RECOGNIZERS) {
			if (message.content.includes(check)) {
				this._logger.log(
					`Table flip recognized in message ${message.id}, using "${check}".`
				);
				const randomIndex = Math.floor(
					Math.random() * TABLE_FLIP_RESPONSES.length
				);
				message.reply(TABLE_FLIP_RESPONSES[randomIndex]);
				break;
			}
		}
	}
}
