import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '@prisma';
import { MESSAGE_PREFIX, interactionReply } from '@util';
import { CommandInteraction, MessageComponentInteraction } from 'discord.js';
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

			return interaction.reply({
				content,
				ephemeral: true,
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
			return interactionReply(interaction, {
				content: `${MESSAGE_PREFIX} Something wen't wrong, try again later!`,
			});
		}

		const { result, data } = radio;

		let content = '';
		if (result === 'NO_VOICE_CHANNEL') {
			content = `${MESSAGE_PREFIX} Play channel is not a voice channel!`;
		}

		if (result === 'NO_PLAYLIST') {
			content = `${MESSAGE_PREFIX} Configured playist is not a playlist!`;
		}

		if (result === 'NO_TRACKS_FOUND') {
			content = `${MESSAGE_PREFIX} Configured playist did not contain any tracks!`;
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
}
