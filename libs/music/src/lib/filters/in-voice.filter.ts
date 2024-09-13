import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { interactionReply } from '@util';
import { EmbedBuilder } from 'discord.js';
import { SlashCommandContext } from 'necord';

import { NotInVoiceException } from '../util/errors';
@Catch(NotInVoiceException)
export class NotInVoiceExceptionFilter implements ExceptionFilter {
	private readonly _logger = new Logger(NotInVoiceExceptionFilter.name);

	async catch(exception: Error, host: ArgumentsHost) {
		const [interaction] = host.getArgByIndex<SlashCommandContext>(0) ?? [
			undefined,
		];
		const message = {
			embeds: [
				new EmbedBuilder()
					.setColor('Red')
					.setTitle('Not in a voice channel')
					.setDescription(
						`Sorry, you have to be in a (or the same) voice channel to use this command!`,
					),
			],
		};
		this._logger.error(exception);

		return interactionReply(interaction, message);
	}
}
