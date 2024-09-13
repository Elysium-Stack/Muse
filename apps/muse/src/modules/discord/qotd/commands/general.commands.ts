import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import {
	ChannelExceptionFilter,
	EnabledExceptionFilter,
	MESSAGE_PREFIX,
} from '@util';
import { Client } from 'discord.js';
import { Context, SlashCommandContext, Subcommand } from 'necord';

import { QotDChannelGuard } from '../guards/channel.guard';
import { QotDEnabledGuard } from '../guards/enabled.guard';
import { QotDCommandDecorator } from '../qotd.decorator';
import { QotDQuestionService } from '../services/question.service';
import { createQuestionEmbed } from '../util/create-question-embed';

@UseGuards(QotDEnabledGuard)
@UseFilters(EnabledExceptionFilter)
@QotDCommandDecorator()
export class QotDGeneralCommands {
	private readonly _logger = new Logger(QotDGeneralCommands.name);

	constructor(
		private _question: QotDQuestionService,
		private _client: Client,
	) {}

	@UseGuards(QotDChannelGuard)
	@UseFilters(ChannelExceptionFilter)
	@Subcommand({
		name: 'random',
		description: 'Send a random question',
	})
	public async show(@Context() [interaction]: SlashCommandContext) {
		this._logger.verbose(`Get a random qotd question`);

		const question = await this._question.get(true);

		if (!question) {
			return interaction.reply({
				content: "Sorry, I couldn't find any questions",
				ephemeral: true,
			});
		}

		const embed = createQuestionEmbed(
			`${MESSAGE_PREFIX} Random question`,
			question,
			this._client.user!,
		);
		return interaction.reply({ content: '', embeds: [embed] });
	}
}
