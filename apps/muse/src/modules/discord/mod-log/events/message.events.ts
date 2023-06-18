import { EMBED_STATUS_COLORS } from '@muse/util/constants';
import { Injectable, Logger } from '@nestjs/common';
import { EmbedBuilder, Events, TextChannel } from 'discord.js';
import { Context, ContextOf, On } from 'necord';
import { ModLogSettingsService } from '../services';

@Injectable()
export class ModLogMessageEvents {
	private readonly _logger = new Logger(ModLogMessageEvents.name);

	constructor(private _settings: ModLogSettingsService) {}

	@On(Events.MessageDelete)
	public async onMessageDelete(
		@Context() [message]: ContextOf<Events.MessageDelete>,
	) {
		const { guildId } = message;
		const { enabled, deleteChannelId } = await this._settings.get(guildId);

		if (!enabled || !deleteChannelId?.length || message.author.bot) {
			return;
		}

		this._logger.log(
			`Mod log message delete running for ${guildId}\nMessage ID: ${message.id}\nAuthor ID:${message.author.id}`,
		);

		const channel = await message.channel.fetch();

		if (!(channel instanceof TextChannel)) {
			return;
		}

		const embed = new EmbedBuilder()
			.setTitle(`Message delete in ${channel.name}`)
			.setDescription(
				`https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}`,
			)
			.addFields(
				{
					name: 'Content',
					value: message.content,
				},
				...(message.attachments.size
					? [
							{
								name: 'Attachments',
								value: message.attachments
									.map((a) => a.url)
									.join('\n'),
							},
					  ]
					: []),
			)
			.setAuthor({
				name: `${message.author.username}${
					message.author.discriminator === '0'
						? ''
						: `#${message.author.discriminator}`
				} | ${message.author.id}`,
				iconURL: message.author.displayAvatarURL() || undefined,
			})
			.setColor(EMBED_STATUS_COLORS.danger)
			.setTimestamp();

		const deleteChannel = await message.guild.channels.fetch(
			deleteChannelId,
		);

		if (!deleteChannel.isTextBased()) {
			return;
		}

		await deleteChannel.send({ embeds: [embed] });
	}

	@On(Events.MessageUpdate)
	public async onMessageUpdate(
		@Context() [original, updated]: ContextOf<Events.MessageUpdate>,
	) {
		const { guildId } = original;
		const { enabled, editChannelId } = await this._settings.get(guildId);

		if (!enabled || !editChannelId?.length || message.author.bot) {
			return;
		}

		this._logger.log(
			`Mod log message edit running for ${guildId}\nMessage ID: ${updated.id}\nAuthor ID:${updated.author.id}`,
		);

		const channel = await updated.channel.fetch();

		if (!(channel instanceof TextChannel)) {
			return;
		}

		const embed = new EmbedBuilder()
			.setTitle(`Message edited in ${channel.name}`)
			.setDescription(
				`https://discord.com/channels/${updated.guildId}/${updated.channelId}/${updated.id}`,
			)
			.addFields(
				{
					name: 'Original content',
					value: original.content,
				},
				{
					name: 'Edited content',
					value: updated.content,
				},
				...(original.attachments.size
					? [
							{
								name: 'Original attachments',
								value: original.attachments
									.map((a) => a.url)
									.join('\n'),
							},
					  ]
					: []),
				...(updated.attachments.size
					? [
							{
								name: 'Edited attachments',
								value: updated.attachments
									.map((a) => a.url)
									.join('\n'),
							},
					  ]
					: []),
			)
			.setAuthor({
				name: `${original.author.username}${
					original.author.discriminator === '0'
						? ''
						: `#${original.author.discriminator}`
				} | ${original.author.id}`,
				iconURL: original.author.displayAvatarURL() || undefined,
			})
			.setColor(EMBED_STATUS_COLORS.warning)
			.setTimestamp();

		const editChannel = await original.guild.channels.fetch(editChannelId);

		if (!editChannel.isTextBased()) {
			return;
		}

		await editChannel.send({ embeds: [embed] });
	}
}
