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
					.setDescription(
						`Sorry, this module command can only be used in a certain channel!`,
					),
			],
		};
		this._logger.error(exception);

		if (!interaction) {
			return;
		}

		if (interaction.deferred) {
			return interaction.editReply(message);
		}

		if (interaction.replied) {
			return interaction.followUp({ ...message, ephemeral: true });
		}

		return interaction.reply({ ...message, ephemeral: true });
	}
}
