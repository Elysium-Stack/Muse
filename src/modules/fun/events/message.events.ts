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
		@Context() [message]: ContextOf<Events.MessageCreate>,
	) {
		this._checkTableFlip(message);
	}

	private _checkTableFlip(message: Message) {
		// 391290157317357579 Bo ID
		// 256474214272335872 Yugen ID
		const id =
			process.env.NODE_ENV === 'production'
				? '391290157317357579'
				: '256474214272335872';

		if (message.author.id === id) {
			for (const check of TABLE_FLIP_RECOGNIZERS) {
				if (message.content.indexOf(check) >= 0) {
					this._logger.log(
						`Table flip recognized in message ${message.id}, using "${check}".`,
					);
					const randomIndex = Math.floor(
						Math.random() * TABLE_FLIP_RESPONSES.length,
					);
					message.reply(TABLE_FLIP_RESPONSES[randomIndex]);
					break;
				}
			}
		}
	}
}
