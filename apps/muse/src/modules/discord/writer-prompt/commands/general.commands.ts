import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import { format, isValid, parse } from 'date-fns';
import {
	ActionRowBuilder,
	Client,
	ModalActionRowComponentBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';
import {
	Context,
	Ctx,
	Modal,
	ModalContext,
	SlashCommandContext,
	Subcommand,
} from 'necord';

import { WriterPromptEnabledGuard } from '../guards/enabled.guard';
import { WriterPromptRoleGuard } from '../guards/role.guard';
import { WriterPromptGeneralService } from '../services/general.service';
import { WriterPromptCommandDecorator } from '../writer-prompt.decorator';

import {
	EnabledExceptionFilter,
	ForbiddenExceptionFilter,
	MESSAGE_PREFIX,
} from '@util';

@UseGuards(WriterPromptEnabledGuard)
@UseFilters(EnabledExceptionFilter)
@WriterPromptCommandDecorator()
export class WriterPromptGeneralCommands {
	private readonly _logger = new Logger(WriterPromptGeneralCommands.name);

	constructor(private _general: WriterPromptGeneralService) {}

	@UseGuards(WriterPromptRoleGuard)
	@UseFilters(ForbiddenExceptionFilter)
	@Subcommand({
		name: 'create',
		description: 'create a prompt',
	})
	public async show(@Context() [interaction]: SlashCommandContext) {
		this._logger.verbose(`Creating a writer prompt`);

		const curDate = format(new Date(), 'yyyy-MM-dd HH:mm');
		const modal = new ModalBuilder()
			.setTitle('Create writer prompt')
			.setCustomId(`WRITER_PROMPT_CREATE_MODAL_RESPONSE`)
			.setComponents([
				new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
					new TextInputBuilder()
						.setCustomId('schedule')
						.setLabel('Schedule (24H UTC Time) (Keep format)')
						.setStyle(TextInputStyle.Short)
						.setValue(curDate)
						.setPlaceholder(curDate)
				),
				new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
					new TextInputBuilder()
						.setCustomId('prompt')
						.setLabel('Prompt to give')
						.setStyle(TextInputStyle.Paragraph)
						.setPlaceholder(
							'The prompt to give the members, you can use discord formatting here.'
						)
				),
			]);

		return interaction.showModal(modal);
	}

	@Modal('WRITER_PROMPT_CREATE_MODAL_RESPONSE')
	public async onFeedbackModalResponse(@Ctx() [interaction]: ModalContext) {
		const schedule = interaction.fields.getTextInputValue('schedule');

		const parsed = parse(schedule, 'yyyy-MM-dd HH:mm', new Date());
		if (!isValid(parsed)) {
			return interaction.reply({
				content: `${MESSAGE_PREFIX} Invalid schedule format.
Please make sure you use the format yyyy-MM-dd HH:mm`,
				ephemeral: true,
			});
		}

		const prompt = interaction.fields.getTextInputValue('prompt');
		const created = await this._general.create(
			interaction.guildId,
			prompt,
			parsed
		);

		if (!created) {
			return interaction.reply({
				content: `${MESSAGE_PREFIX} Failed to create prompt. Try again later.`,
				ephemeral: true,
			});
		}

		return interaction.reply({
			content: `${MESSAGE_PREFIX} Prompt has been created and scheduled to be run at \`${schedule}\`!`,
			ephemeral: true,
		});
	}
}
