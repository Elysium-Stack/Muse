import { MESSAGE_PREFIX } from '@muse/util';
import { Logger } from '@nestjs/common';
import {
	ActionRowBuilder,
	Client,
	ModalActionRowComponentBuilder,
	ModalBuilder,
	SelectMenuBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';
import {
	Context,
	Ctx,
	Modal,
	ModalContext,
	ModalParam,
	SelectedStrings,
	SlashCommandContext,
	StringSelect,
	StringSelectContext,
	Subcommand,
} from 'necord';
import { FeedbackCommandDecorator } from '../feedback.decorator';
import { FeedbackService } from '../services';

@FeedbackCommandDecorator()
export class FeedbackGeneralCommands {
	private readonly _logger = new Logger(FeedbackGeneralCommands.name);

	constructor(private _feedback: FeedbackService, private _client: Client) {}

	@Subcommand({
		name: 'give',
		description: 'Give feedback to a topic',
	})
	public async give(@Context() [interaction]: SlashCommandContext) {
		const topics = await this._feedback.getAllTopics(interaction.guildId!);

		const select = new StringSelectMenuBuilder()
			.setCustomId('FEEDBACK_GIVE_TOPIC_SELECT')
			.setPlaceholder('Select the topic to reply to')
			.setOptions(
				topics.map(({ id, name }) =>
					new StringSelectMenuOptionBuilder()
						.setLabel(name)
						.setValue(id.toString()),
				),
			);

		const selectRow =
			new ActionRowBuilder<SelectMenuBuilder>().addComponents(select);

		const data = {
			content: `${MESSAGE_PREFIX} What topic would you give feedback to?`,
			embeds: [],
			components: [selectRow],
		};

		return interaction.reply({
			...data,
			ephemeral: true,
		});
	}

	@StringSelect('FEEDBACK_GIVE_TOPIC_SELECT')
	public async onTopicSelect(
		@Context() [interaction]: StringSelectContext,
		@SelectedStrings() [topicId]: string[],
	) {
		this._logger.log(
			`User ${interaction.user.id} wants to give feedback to ${topicId}`,
		);

		const topic = await this._feedback.getTopicById(
			interaction.guildId!,
			parseInt(topicId, 10),
		);

		if (!topic) {
			return interaction.reply({
				content: `${MESSAGE_PREFIX} That topic doesn't exist`,
				ephemeral: true,
			});
		}

		const modal = new ModalBuilder()
			.setTitle(topic.name)
			.setCustomId(`FEEDBACK_GIVE_MODAL_RESPONSE/${topicId}`)
			.setComponents([
				new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
					[
						new TextInputBuilder()
							.setCustomId('response')
							.setLabel('Your feedback')
							.setStyle(TextInputStyle.Paragraph),
					],
				),
			]);

		return interaction.showModal(modal);
	}

	@Modal('FEEDBACK_GIVE_MODAL_RESPONSE/:topicId')
	public async onFeedbackModalResponse(
		@Ctx() [interaction]: ModalContext,
		@ModalParam('topicId') topicId: string,
	) {
		const response = interaction.fields.getTextInputValue('response');

		await this._feedback.processFeedback(
			topicId,
			interaction.guildId!,
			interaction.user,
			response,
		);

		return interaction.reply({
			content: `${MESSAGE_PREFIX} Thank you for your feedback!`,
			ephemeral: true,
		});
	}
}
