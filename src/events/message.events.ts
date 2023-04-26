import { PrismaService } from '@muse/modules/prisma';
import { Injectable, Logger } from '@nestjs/common';
import { Events, Message } from 'discord.js';
import { Context, ContextOf, On } from 'necord';

@Injectable()
export class MessageEvents {
	private readonly _logger = new Logger(MessageEvents.name);

	constructor(private _prisma: PrismaService) {}

	@On(Events.MessageCreate)
	public onMessageCreate(
		@Context() [message]: ContextOf<Events.MessageCreate>,
	) {
		this._checkForReactionTriggers(message);
	}

	private async _checkForReactionTriggers(message: Message) {
		if (!message.inGuild() || message.author.bot) {
			return;
		}

		const where = {
			guildId: message.guildId,
		};

		const triggersCount = await this._prisma.messageReactionTriggers.count({
			where,
		});

		if (!triggersCount) {
			return;
		}

		const triggers = await this._prisma.messageReactionTriggers.findMany({
			where,
		});

		for (const { regex, emojiId } of triggers) {
			const regexInstance = new RegExp(regex, 'ig');
			const test = regexInstance.test(message.cleanContent);
			if (!test) {
				continue;
			}

			this._logger.debug(
				`Got a match for ${regexInstance} on ${message.guildId}, adding emote with id ${emojiId}`,
			);
			await message.react(emojiId);
		}
	}
}
