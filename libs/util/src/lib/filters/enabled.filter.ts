import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { interactionReply } from '@util';
import { ModuleNotEnabledException } from '@util/errors';
import { EmbedBuilder } from 'discord.js';
import { SlashCommandContext } from 'necord';

@Catch(ModuleNotEnabledException)
export class EnabledExceptionFilter implements ExceptionFilter {
	private readonly _logger = new Logger(EnabledExceptionFilter.name);

	async catch(exception: Error, host: ArgumentsHost) {
		const [interaction] = host.getArgByIndex<SlashCommandContext>(0) ?? [
			undefined,
		];
		const message = {
			embeds: [
				new EmbedBuilder()
					.setColor('Red')
					.setTitle('Module not enabled')
					.setDescription(exception.message),
			],
		};
		this._logger.error(exception);

		return interactionReply(interaction, message);
	}
}
