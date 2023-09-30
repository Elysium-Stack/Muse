import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '@prisma';
import { MESSAGE_PREFIX } from '@util';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	CommandInteraction,
	EmbedBuilder,
	MessageComponentInteraction,
} from 'discord.js';
import { firstValueFrom, take } from 'rxjs';
@Injectable()
export class RadioService {
	private readonly _logger = new Logger(RadioService.name);

	constructor(
		private _prisma: PrismaService,
		@Inject('RADIO_SERVICE') private _radio: ClientProxy,
	) {}

	async start(interaction: CommandInteraction | MessageComponentInteraction) {
		await interaction.deferReply({ ephemeral: true });

		const settings = await this._prisma.settings.findUnique({
			where: {
				guildId: interaction.guildId,
			},
		});

		if (
			(!settings ||
				!settings.radioPlaylist ||
				!settings.radioVoiceChannelId) &&
			interaction
		) {
			const content = `${MESSAGE_PREFIX} Radio settings we're not congigured correctly.`;

			if (interaction instanceof MessageComponentInteraction) {
				return interaction.update({
					content,
				});
			}

			return interaction.editReply({
				content,
			});
		}

		const { radioPlaylist, radioVoiceChannelId, radioTextChannelId } =
			settings;

		const radio = await (firstValueFrom(
			this._radio
				.send('RADIO_START', {
					guildId: interaction.guildId,
					radioPlaylist,
					radioVoiceChannelId,
					radioTextChannelId,
				})
				.pipe(take(1)),
		) as Promise<{ result: string; data: any }>);

		if (!radio) {
			const content = `${MESSAGE_PREFIX} Something wen't wrong, try again later!`;

			if (interaction instanceof MessageComponentInteraction) {
				return interaction.update({
					content,
				});
			}

			return interaction.editReply({
				content,
			});
		}

		const { result, data } = radio;

		let content = '';
		if (result === 'NO_VOICE_CHANNEL') {
			content = `${MESSAGE_PREFIX} Play channel is not a voice channel!`;
		}

		if (result === 'NO_PLAYLIST') {
			content = `${MESSAGE_PREFIX} Configured playlist is not a playlist!`;
		}

		if (result === 'NO_TRACKS_FOUND') {
			content = `${MESSAGE_PREFIX} Configured playlist did not contain any tracks!`;
		}

		if (result === 'PLAYING') {
			content = `${MESSAGE_PREFIX} Started playlist with ${data.tracks.length} tracks from \`${data.playlistName}\` in <#${data.voiceChannelId}>`;
		}

		if (interaction instanceof MessageComponentInteraction) {
			return interaction.update({
				content,
			});
		}

		return interaction.editReply({
			content,
		});
	}

	async stop(interaction: CommandInteraction | MessageComponentInteraction) {
		await firstValueFrom(
			this._radio
				.send('RADIO_STOP', {
					guildId: interaction.guildId,
				})
				.pipe(take(1)),
		);

		const data = {
			content: `${MESSAGE_PREFIX} Stopped radio!`,
		};

		if (interaction instanceof MessageComponentInteraction) {
			return interaction.update(data);
		}

		return interaction.reply({
			...data,
			ephemeral: true,
		});
	}

	async next(interaction: CommandInteraction | MessageComponentInteraction) {
		const { result } = await firstValueFrom(
			this._radio
				.send('RADIO_NEXT', {
					guildId: interaction.guildId,
				})
				.pipe(take(1)),
		);

		const data = {
			content: `${MESSAGE_PREFIX} Starting the next song!`,
		};

		if (result === 'NOT_PLAYING') {
			data.content = `${MESSAGE_PREFIX} Radio is not playing!`;
		}

		if (interaction instanceof MessageComponentInteraction) {
			return interaction.update(data);
		}

		return interaction.reply({
			...data,
			ephemeral: true,
		});
	}

	async previous(
		interaction: CommandInteraction | MessageComponentInteraction,
	) {
		const { result } = await firstValueFrom(
			this._radio
				.send('RADIO_PREVIOUS', {
					guildId: interaction.guildId,
				})
				.pipe(take(1)),
		);

		const data = {
			content: `${MESSAGE_PREFIX} Starting the next song!`,
		};

		if (result === 'NOT_PLAYING') {
			data.content = `${MESSAGE_PREFIX} Radio is not playing!`;
		}

		if (result === 'NO_PREVIOUS') {
			data.content = `${MESSAGE_PREFIX} There is no previous song!`;
		}

		if (interaction instanceof MessageComponentInteraction) {
			return interaction.update(data);
		}

		return interaction.reply({
			...data,
			ephemeral: true,
		});
	}

	async queue(
		interaction: CommandInteraction | MessageComponentInteraction,
		page: number,
	) {
		const { result, ...rest } = await firstValueFrom(
			this._radio
				.send('RADIO_QUEUE', {
					guildId: interaction.guildId,
					page,
				})
				.pipe(take(1)),
		);

		if (result === 'NOT_PLAYING') {
			if (interaction instanceof MessageComponentInteraction) {
				return interaction.update({
					content: `${MESSAGE_PREFIX} Radio is not playing!`,
				});
			}

			return interaction.reply({
				content: `${MESSAGE_PREFIX} Radio is not playing!`,
				ephemeral: true,
			});
		}

		const { queue, total, current } = rest;

		const totalPages = Math.ceil(total / 10);
		let embed = new EmbedBuilder()
			.setTitle(`🎶 Radio queue |  ${total} songs in queue`)
			.setFooter({
				text: `Page ${page}/${totalPages}`,
			});

		if (page === 1) {
			embed = embed.addFields({
				name: 'Current',
				value: `1. [${current.title}](${current.uri})`,
				inline: true,
			});
		}

		embed = embed.addFields({
			name: 'Queue',
			value: !queue?.length
				? 'No items in the queue'
				: queue
						.map(
							(track, index) =>
								`${index + 2 + (page - 1) * 10}. [${
									track.title
								}](${track.uri})`,
						)
						.join('\n'),
			inline: false,
		});

		const components = [
			new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder()
					.setCustomId(`RADIO_QUEUE/${page - 1}`)
					.setLabel('◀️')
					.setStyle(ButtonStyle.Secondary)
					.setDisabled(page == 1),
				new ButtonBuilder()
					.setCustomId(`RADIO_QUEUE/${page + 1}`)
					.setLabel('▶️')
					.setStyle(ButtonStyle.Secondary)
					.setDisabled(page === totalPages || totalPages === 1),
			),
		];

		if (interaction instanceof MessageComponentInteraction) {
			return interaction.update({ embeds: [embed], components });
		}

		return interaction.reply({
			embeds: [embed],
			components,
			ephemeral: true,
		});
	}
}
