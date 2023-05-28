import { interactionReply } from '@muse/util';
import { IncorrectChannelException } from '@muse/util/errors';
import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { EmbedBuilder } from 'discord.js';
import { SlashCommandContext } from 'necord';

@Catch(IncorrectChannelException)
export class ChannelExceptionFilter implements ExceptionFilter {
	private readonly _logger = new Logger(ChannelExceptionFilter.name);

	async catch(exception: Error, host: ArgumentsHost) {
		const [interaction] = host.getArgByIndex<SlashCommandContext>(0) ?? [
			undefined,
		];
		const message = {
			embeds: [
				new EmbedBuilder()
					.setColor('Red')
					.setTitle('Incorrect channel')
					.setDescription(exception.message),
			],
		};
		this._logger.error(exception);

		return interactionReply(interaction, message);
	}
}
