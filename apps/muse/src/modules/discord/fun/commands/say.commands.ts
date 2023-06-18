import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import {
	ForbiddenExceptionFilter,
	GuildAdminGuard,
	MESSAGE_PREFIX,
} from '@util';
import {
	ActionRowBuilder,
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
	SlashCommand,
	SlashCommandContext,
} from 'necord';

@UseGuards(GuildAdminGuard)
@UseFilters(ForbiddenExceptionFilter)
export class FunSayCommands {
	private readonly _logger = new Logger(FunSayCommands.name);

	@SlashCommand({
		name: 'say',
		description: 'Make the bot say something',
	})
	public async say(@Context() [interaction]: SlashCommandContext) {
		const modal = new ModalBuilder()
			.setTitle('What should I say?')
			.setCustomId(`ADMIN_SAY`)
			.setComponents([
				new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
					new TextInputBuilder()
						.setCustomId('message')
						.setLabel('Message')
						.setStyle(TextInputStyle.Paragraph),
				),
				new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
					new TextInputBuilder()
						.setCustomId('channelId')
						.setLabel('Channel ID')
						.setStyle(TextInputStyle.Short)
						.setValue(interaction.channelId),
				),
				new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
					new TextInputBuilder()
						.setCustomId('replyId')
						.setLabel('Reply to message ID')
						.setStyle(TextInputStyle.Short)
						.setRequired(false)
						.setValue(''),
				),
			]);

		return interaction.showModal(modal);
	}

	@Modal('ADMIN_SAY')
	public async onFeedbackModalResponse(@Ctx() [interaction]: ModalContext) {
		const message = interaction.fields.getTextInputValue('message');
		let channelId = interaction.fields.getTextInputValue('channelId');
		let replyId = interaction.fields.getTextInputValue('replyId');

		if (!message?.length) {
			return interaction.reply({
				content: `${MESSAGE_PREFIX} You must provide a message!`,
				ephemeral: true,
			});
		}

		if (!channelId?.length) {
			channelId = interaction.channelId;
		}

		const channel = await interaction.guild.channels
			.fetch(channelId)
			.catch((err) => null);

		if (!channel) {
			return interaction.reply({
				content: `${MESSAGE_PREFIX} Could not find the channel with id "${channelId}"!`,
				ephemeral: true,
			});
		}

		if (!channel.isTextBased()) {
			return interaction.reply({
				content: `${MESSAGE_PREFIX} <#${channelId}> is not a text based channel!`,
				ephemeral: true,
			});
		}

		if (!replyId?.length) {
			// send the message to a channel beacuse there is no replyId
			await channel.send(message);

			return interaction.reply({
				content: `${MESSAGE_PREFIX} Sent your message!`,
				ephemeral: true,
			});
		}

		const replyMessage = await channel.messages
			.fetch(replyId)
			.catch((err) => null);

		if (!replyMessage) {
			return interaction.reply({
				content: `${MESSAGE_PREFIX} Could not find the message with id "${replyId}" in <#${channelId}> to reply to!`,
				ephemeral: true,
			});
		}

		await replyMessage.reply(message);

		return interaction.reply({
			content: `${MESSAGE_PREFIX} Sent your message!`,
			ephemeral: true,
		});
	}
}
