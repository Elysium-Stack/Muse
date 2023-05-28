import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import { ForbiddenExceptionFilter, MESSAGE_PREFIX } from '@util';
import {
	ActionRowBuilder,
	ModalActionRowComponentBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';
import { AdminGuard } from 'libs/util/src/lib/guards/admin.guard';
import {
	Context,
	Ctx,
	Modal,
	ModalContext,
	SlashCommandContext,
	Subcommand,
} from 'necord';
import { AdminCommandDecorator } from '..';

@UseGuards(AdminGuard)
@UseFilters(ForbiddenExceptionFilter)
@AdminCommandDecorator()
export class AdminSayCommands {
	private readonly _logger = new Logger(AdminSayCommands.name);

	@Subcommand({
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
			]);

		return interaction.showModal(modal);
	}

	@Modal('ADMIN_SAY')
	public async onFeedbackModalResponse(@Ctx() [interaction]: ModalContext) {
		const message = interaction.fields.getTextInputValue('message');
		let channelId = interaction.fields.getTextInputValue('channelId');

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

		channel.send(message);

		return interaction.reply({
			content: `${MESSAGE_PREFIX} Sent your message!`,
			ephemeral: true,
		});
	}
}
