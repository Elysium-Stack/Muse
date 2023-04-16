import { MESSAGE_PREFIX } from '@hermes/util/constants';
import { Logger } from '@nestjs/common';
import { Client } from 'discord.js';
import { Context, SlashCommandContext, Subcommand } from 'necord';
import { BookwormCommandDecorator } from '../bookworm.decorator';
import { BookwormGeneralService } from '../services/general.service';
import { createQuestionEmbed } from '../util/create-question-embed';

@BookwormCommandDecorator()
export class BookwormGeneralCommands {
	private readonly _logger = new Logger(BookwormGeneralCommands.name);

	constructor(
		private _general: BookwormGeneralService,
		private _client: Client,
	) {}

	@Subcommand({
		name: 'random',
		description: 'Send a random question',
	})
	public async show(@Context() [interaction]: SlashCommandContext) {
		this._logger.verbose(`Get a random bookworm question`);

		const question = await this._general.getQuestion(null, true);

		const embed = createQuestionEmbed(
			`${MESSAGE_PREFIX} Random question`,
			question,
			this._client.user,
		);
		return interaction.reply({ content: '', embeds: [embed] });
	}
}
