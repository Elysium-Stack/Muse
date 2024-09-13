import { Injectable, Logger } from '@nestjs/common';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	CommandInteraction,
	EmbedBuilder,
	MessageComponentInteraction,
} from 'discord.js';
import { KazagumoSearchResult, KazagumoTrack } from 'kazagumo';

import { getVoiceChannelFromInteraction } from '@music';

import { MusicInstancesService } from './instances.service';

import { MESSAGE_PREFIX } from '@util';

@Injectable()
export class MusicService {
	private readonly _logger = new Logger(MusicService.name);

	constructor(private _instances: MusicInstancesService) {}

	async play(
		interaction: CommandInteraction | MessageComponentInteraction,
		song: string
	) {
		await interaction.deferReply({ ephemeral: true });

		const channel = await getVoiceChannelFromInteraction(interaction);
		if (!channel) {
			return;
		}

		const music = await this._send<{
			data: KazagumoSearchResult;
		}>(interaction, 'MUSIC_PLAY', {
			guildId: interaction.guildId,
			song,
			voiceChannelId: channel.id,
			textChannelId: interaction.channelId,
			author: interaction.user,
		});

		if (!music) {
			return;
		}

		const { result, data } = music;

		let content = '';
		if (result === 'GUILD_NOT_FOUND') {
			content = `${MESSAGE_PREFIX} Something wen't wrong, try again later!`;
		}

		if (result === 'NO_VOICE_CHANNEL') {
			content = `${MESSAGE_PREFIX} Voice channel not found, can the music bot join it?`;
		}

		if (result === 'NO_PLAYLIST') {
			content = `${MESSAGE_PREFIX} Song is not a playlist!`;
		}

		if (result === 'NO_TRACKS_FOUND') {
			content = `${MESSAGE_PREFIX} Could not find any tracks with song query!`;
		}

		if (result === 'PLAYING') {
			content =
				data.type === 'PLAYLIST'
					? `Queued ${data.tracks.length} tracks from \`${data.playlistName}\``
					: `Queued \`${data.tracks[0].title}\``;
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
		const channel = await getVoiceChannelFromInteraction(interaction);
		if (!channel) {
			return;
		}

		const music = await this._send(interaction, 'MUSIC_STOP', {
			guildId: interaction.guildId,
			voiceChannelId: channel.id,
		});

		if (!music) {
			return;
		}

		const content = `${MESSAGE_PREFIX} Stopped playing your music, bye!`;

		if (interaction instanceof MessageComponentInteraction) {
			return interaction.update({ content });
		}

		return interaction.reply({
			content,
			ephemeral: true,
		});
	}

	async next(
		interaction: CommandInteraction | MessageComponentInteraction,
		sendMessage = true
	) {
		const channel = await getVoiceChannelFromInteraction(interaction);
		if (!channel) {
			return;
		}

		const music = await this._send(interaction, 'MUSIC_NEXT', {
			guildId: interaction.guildId,
			voiceChannelId: channel.id,
		});

		if (!music) {
			return;
		}

		if (!sendMessage) {
			return;
		}

		const { result } = music;

		let content = '';
		if (result === 'EMPTY_QUEUE') {
			content = `${MESSAGE_PREFIX} No songs left in queue to skip play.`;
		}

		if (result === 'NEXT') {
			content = `${MESSAGE_PREFIX} Playing the next song!`;
		}

		if (interaction instanceof MessageComponentInteraction) {
			return interaction.update({ content });
		}

		return interaction.reply({
			content,
			ephemeral: true,
		});
	}

	async previous(
		interaction: CommandInteraction | MessageComponentInteraction,
		sendMessage = true
	) {
		const channel = await getVoiceChannelFromInteraction(interaction);
		if (!channel) {
			return;
		}

		const music = await this._send(interaction, 'MUSIC_PREVIOUS', {
			guildId: interaction.guildId,
			voiceChannelId: channel.id,
		});

		if (!music) {
			return;
		}

		if (!sendMessage) {
			return;
		}

		const { result } = music;

		let content = '';
		if (result === 'NO_PREVIOUS') {
			content = `${MESSAGE_PREFIX} There is no song before this one to play.`;
		}

		if (result === 'PREVIOUS') {
			content = `${MESSAGE_PREFIX} Playing the pervious song!`;
		}

		if (interaction instanceof MessageComponentInteraction) {
			return interaction.update({ content });
		}

		return interaction.reply({
			content,
			ephemeral: true,
		});
	}

	async shuffle(
		interaction: CommandInteraction | MessageComponentInteraction,
		sendMessage = true
	) {
		const channel = await getVoiceChannelFromInteraction(interaction);
		if (!channel) {
			return;
		}

		const music = await this._send(interaction, 'MUSIC_SHUFFLE', {
			guildId: interaction.guildId,
			voiceChannelId: channel.id,
		});

		if (!music) {
			return;
		}

		if (!sendMessage) {
			return;
		}

		const content = `${MESSAGE_PREFIX} Shuffling the music!`;

		if (interaction instanceof MessageComponentInteraction) {
			return interaction.update({ content });
		}

		return interaction.reply({
			content,
			ephemeral: true,
		});
	}

	async loop(
		interaction: CommandInteraction | MessageComponentInteraction,
		sendMessage = true
	) {
		const channel = await getVoiceChannelFromInteraction(interaction);
		if (!channel) {
			return;
		}

		const music = await this._send<{ type: 'queue' | 'none' }>(
			interaction,
			'MUSIC_LOOP',
			{
				guildId: interaction.guildId,
				voiceChannelId: channel.id,
			}
		);

		if (!music) {
			return;
		}

		if (!sendMessage) {
			return;
		}

		const { type } = music;

		const content = `${MESSAGE_PREFIX} ${
			type === 'queue' ? 'Looping' : 'Stopped loop of'
		} the current playlist!`;

		if (interaction instanceof MessageComponentInteraction) {
			return interaction.update({ content });
		}

		return interaction.reply({
			content,
			ephemeral: true,
		});
	}

	async pause(
		interaction: CommandInteraction | MessageComponentInteraction,
		sendMessage = true
	) {
		const channel = await getVoiceChannelFromInteraction(interaction);
		if (!channel) {
			return;
		}

		const music = await this._send(interaction, 'MUSIC_PAUSE', {
			guildId: interaction.guildId,
			voiceChannelId: channel.id,
		});

		if (!music) {
			return;
		}

		if (!sendMessage) {
			return;
		}

		const { result } = music;

		let content = '';
		if (result === 'ALREADY_PAUSED') {
			content = `${MESSAGE_PREFIX} Music is already paused.`;
		}

		if (result === 'PAUSED') {
			content = `${MESSAGE_PREFIX} Paused the music!`;
		}

		if (interaction instanceof MessageComponentInteraction) {
			return interaction.update({ content });
		}

		return interaction.reply({
			content,
			ephemeral: true,
		});
	}

	async resume(
		interaction: CommandInteraction | MessageComponentInteraction,
		sendMessage = true
	) {
		const channel = await getVoiceChannelFromInteraction(interaction);
		if (!channel) {
			return;
		}

		const music = await this._send(interaction, 'MUSIC_RESUME', {
			guildId: interaction.guildId,
			voiceChannelId: channel.id,
		});

		if (!music) {
			return;
		}

		if (!sendMessage) {
			return;
		}

		const { result } = music;

		let content = '';
		if (result === 'NOT_PAUSED') {
			content = `${MESSAGE_PREFIX} Music is already playing.`;
		}

		if (result === 'RESUMED') {
			content = `${MESSAGE_PREFIX} Resumed the music!`;
		}

		if (interaction instanceof MessageComponentInteraction) {
			return interaction.update({ content });
		}

		return interaction.reply({
			content,
			ephemeral: true,
		});
	}

	async setVolume(
		interaction: CommandInteraction | MessageComponentInteraction,
		setVolume: number,
		setIsMute = false,
		sendMessage = true
	) {
		const channel = await getVoiceChannelFromInteraction(interaction);
		if (!channel) {
			return;
		}

		const music = await this._send<{ volume: number; isMute: boolean }>(
			interaction,
			'MUSIC_SET_VOLUME',
			{
				guildId: interaction.guildId,
				voiceChannelId: channel.id,
				volume: setVolume,
				isMute: setIsMute,
			}
		);

		if (!music) {
			return;
		}

		if (!sendMessage) {
			return;
		}

		const { volume, isMute } = music;

		const content = `${MESSAGE_PREFIX} ${
			isMute ? `Muted the music!` : `Set music volume to ${volume}%`
		}`;

		if (interaction instanceof MessageComponentInteraction) {
			return interaction.update({ content });
		}

		return interaction.reply({
			content,
			ephemeral: true,
		});
	}

	async getVolume(
		interaction: CommandInteraction | MessageComponentInteraction
	) {
		const channel = await getVoiceChannelFromInteraction(interaction);
		if (!channel) {
			return;
		}

		const music = await this._send<{ volume: number }>(
			interaction,
			'MUSIC_GET_VOLUME',
			{
				guildId: interaction.guildId,
				voiceChannelId: channel.id,
			}
		);

		if (!music) {
			return;
		}

		const { volume } = music;
		return volume;
	}

	async queue(
		interaction: CommandInteraction | MessageComponentInteraction,
		page: number
	) {
		const channel = await getVoiceChannelFromInteraction(interaction);
		if (!channel) {
			return;
		}

		const music = await this._send<{
			queue: KazagumoTrack[];
			current: KazagumoTrack;
			total: number;
		}>(interaction, 'MUSIC_QUEUE', {
			guildId: interaction.guildId,
			voiceChannelId: channel.id,
			page,
		});

		if (!music) {
			return;
		}

		const { queue, total, current } = music;

		const totalPages = Math.ceil(total / 10);
		let embed = new EmbedBuilder()
			.setTitle(`🎶 Current queue |  ${total} songs in queue`)
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
			value: queue?.length
				? queue
						.map(
							(track, index) =>
								`${index + 2 + (page - 1) * 10}. [${track.title}](${track.uri})`
						)
						.join('\n')
				: 'No items in the queue',
			inline: false,
		});

		const components = [
			new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder()
					.setCustomId(`MUSIC_QUEUE/${page - 1}`)
					.setLabel('◀️')
					.setStyle(ButtonStyle.Secondary)
					.setDisabled(page == 1),
				new ButtonBuilder()
					.setCustomId(`MUSIC_QUEUE/${page + 1}`)
					.setLabel('▶️')
					.setStyle(ButtonStyle.Secondary)
					.setDisabled(page === totalPages || totalPages === 1)
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

	private async _send<T>(
		interaction: CommandInteraction | MessageComponentInteraction,
		command: string,
		data: unknown
	): Promise<{ result: string } & T> {
		const voiceChannel = await getVoiceChannelFromInteraction(interaction);
		const instance = await this._instances.getAvailableOrExisting(
			interaction.guildId,
			voiceChannel.id
		);

		if (!instance) {
			const content = `${MESSAGE_PREFIX} Sorry, there is no music instance available!`;

			if (interaction instanceof MessageComponentInteraction) {
				interaction.update({
					content,
				});
				return null;
			}

			interaction.deferred
				? interaction.editReply({
						content,
					})
				: interaction.reply({ content });
			return null;
		}

		const music = await this._instances.sendCommand(
			instance,
			command,
			data
		);

		if (!music) {
			const content = `${MESSAGE_PREFIX} Something wen't wrong, try again later!`;

			if (interaction instanceof MessageComponentInteraction) {
				interaction.update({
					content,
				});
				return null;
			}

			interaction.deferred
				? interaction.editReply({
						content,
					})
				: interaction.reply({ content });
			return null;
		}

		if (music.result === 'NO_PLAYER') {
			const content = `${MESSAGE_PREFIX} I am not currently playing any songs!`;

			if (interaction instanceof MessageComponentInteraction) {
				interaction.update({
					content,
				});
				return null;
			}

			interaction.deferred
				? interaction.editReply({
						content,
					})
				: interaction.reply({ content });
			return null;
		}

		return music as { result: string } & T;
	}
}
