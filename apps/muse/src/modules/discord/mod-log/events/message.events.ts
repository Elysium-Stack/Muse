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

		if (!enabled || !deleteChannelId?.length) {
			return;
		}

		if (message.author.bot) {
			return;
		}

		this._logger.log(
			`Mod log message delete running for ${guildId}\nMessage ID: ${message.id}\nAuthor ID:${message.author.id}`,
		);

		const channel = await message.channel.fetch();

		if (!(channel instanceof TextChannel)) {
			return;
		}

		try {
			const content = message.content.match(/(.|[\r\n]){1,1024}/g);

			const embed = new EmbedBuilder()
				.setTitle(`Message delete in ${channel.name}`)
				.setDescription(
					`https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}`,
				)
				.addFields(
					...content.map((part, i) => ({
						name: i === 0 ? 'Content' : ' ',
						value: part,
					})),
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
		} catch (err) {
			console.log(err);
			this._logger.error(err);
		}
	}

	@On(Events.MessageUpdate)
	public async onMessageUpdate(
		@Context() [original, updated]: ContextOf<Events.MessageUpdate>,
	) {
		const { guildId } = original;
		const { enabled, editChannelId } = await this._settings.get(guildId);

		if (!enabled || !editChannelId?.length) {
			return;
		}

		if (original.author.bot || updated.author.bot) {
			return;
		}

		if (original.cleanContent === updated.cleanContent) {
			return;
		}

		this._logger.log(
			`Mod log message edit running for ${guildId}\nMessage ID: ${updated.id}\nAuthor ID:${updated.author.id}`,
		);

		const channel = await updated.channel.fetch();

		if (!(channel instanceof TextChannel)) {
			return;
		}

		try {
			const originalContent =
				original.content.match(/(.|[\r\n]){1,1024}/g);
			const updatedContent = updated.content.match(/(.|[\r\n]){1,1024}/g);

			const embeds = [];

			const embed = new EmbedBuilder()
				.setTitle(`Message edited in ${channel.name}`)
				.setDescription(
					`https://discord.com/channels/${updated.guildId}/${updated.channelId}/${updated.id}`,
				)
				.addFields(
					...(originalContent?.length === 1 &&
					updatedContent?.length === 1
						? [
								{
									name: 'Original content',
									value: originalContent[0],
								},
						  ]
						: []),
					...(originalContent?.length === 1 &&
					updatedContent?.length === 1
						? [
								{
									name: 'Edited content',
									value: updatedContent[0],
								},
						  ]
						: []),
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

			embeds.push(embed);

			if (originalContent.length > 1) {
				embeds.push(
					new EmbedBuilder()
						.setTitle(`Original content`)
						.setDescription(
							`https://discord.com/channels/${original.guildId}/${
								original.channelId
							}/${original.id}\n
							${originalContent.join('')}`,
						)
						// .addFields(
						// 	...originalContent.map((part, i) => ({
						// 		name: ' ',
						// 		value: part,
						// 	})),
						// )
						.setAuthor({
							name: `${original.author.username}${
								original.author.discriminator === '0'
									? ''
									: `#${original.author.discriminator}`
							} | ${original.author.id}`,
							iconURL:
								original.author.displayAvatarURL() || undefined,
						})
						.setColor(EMBED_STATUS_COLORS.warning)
						.setTimestamp(),
				);
			}

			if (updatedContent.length > 1) {
				embeds.push(
					new EmbedBuilder()
						.setTitle(`Edited content`)
						.setDescription(
							`https://discord.com/channels/${updated.guildId}/${
								updated.channelId
							}/${updated.id}\n
							${updatedContent.join('')}`,
						)
						// .addFields(
						// 	...updatedContent.map((part, i) => ({
						// 		name: ' ',
						// 		value: part,
						// 	})),
						// )
						.setAuthor({
							name: `${updated.author.username}${
								updated.author.discriminator === '0'
									? ''
									: `#${updated.author.discriminator}`
							} | ${updated.author.id}`,
							iconURL:
								updated.author.displayAvatarURL() || undefined,
						})
						.setColor(EMBED_STATUS_COLORS.warning)
						.setTimestamp(),
				);
			}

			const editChannel = await original.guild.channels.fetch(
				editChannelId,
			);

			if (!editChannel.isTextBased()) {
				return;
			}

			for (let embed of embeds) {
				await editChannel.send({ embeds: [embed] });
			}
		} catch (err) {
			console.log(err);
			this._logger.error(err);
		}
	}
}
