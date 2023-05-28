import {
	ChannelExceptionFilter,
	EnabledExceptionFilter,
	MESSAGE_PREFIX,
} from '@muse/util';
import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import { Client } from 'discord.js';
import { Context, SlashCommandContext, Subcommand } from 'necord';
import { BookwormCommandDecorator } from '../bookworm.decorator';
import { BookwormChannelGuard } from '../guards/channel.guard';
import { BookwormEnabledGuard } from '../guards/enabled.guard';
import { BookwormQuestionService } from '../services/question.service';
import { createQuestionEmbed } from '../util/create-question-embed';

@UseGuards(BookwormEnabledGuard)
@UseFilters(EnabledExceptionFilter)
@BookwormCommandDecorator()
export class BookwormGeneralCommands {
	private readonly _logger = new Logger(BookwormGeneralCommands.name);

	constructor(
		private _question: BookwormQuestionService,
		private _client: Client,
	) {}

	@UseGuards(BookwormChannelGuard)
	@UseFilters(ChannelExceptionFilter)
	@Subcommand({
		name: 'random',
		description: 'Send a random question',
	})
	public async show(@Context() [interaction]: SlashCommandContext) {
		this._logger.verbose(`Get a random bookworm question`);

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
