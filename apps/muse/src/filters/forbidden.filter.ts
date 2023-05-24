import { interactionReply } from '@muse/util/interaction-replies';
import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	ForbiddenException,
	Logger,
} from '@nestjs/common';
import { EmbedBuilder } from 'discord.js';
import { SlashCommandContext } from 'necord';

@Catch(ForbiddenException)
export class ForbiddenExceptionFilter implements ExceptionFilter {
	private readonly _logger = new Logger(ForbiddenExceptionFilter.name);

	async catch(exception: Error, host: ArgumentsHost) {
		const [interaction] = host.getArgByIndex<SlashCommandContext>(0) ?? [
			undefined,
		];
		const message = {
			embeds: [
				new EmbedBuilder()
					.setColor('Red')
					.setTitle('Forbidden')
					.setDescription(`Sorry, you can't use this interaction!`),
			],
		};
		this._logger.error(exception);

		return interactionReply(interaction, message);
	}
}
