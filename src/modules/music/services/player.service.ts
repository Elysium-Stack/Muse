import { PrismaService } from '@muse/modules/prisma';
import { interactionReply } from '@muse/util/interaction-replies';
import { Injectable, Logger } from '@nestjs/common';
import { CommandInteraction, MessageComponentInteraction } from 'discord.js';
import { LavalinkService } from './lavalink.service';

@Injectable()
export class MusicPlayerService {
	private readonly _logger = new Logger(MusicPlayerService.name);

	protected _base = 'music';

	constructor(
		protected _lavalink: LavalinkService,
		private _prisma: PrismaService,
	) {}

	get(guildId: string) {
		return this._lavalink.players.get(guildId);
	}

	async play(
		interaction: MessageComponentInteraction | CommandInteraction,
		song: string,
	) {
		this._logger.verbose(
			`Playing song for ${interaction.user.tag}: ${song}`,
		);

		const member = await interaction.guild.members.fetch(
			interaction.user.id,
		);
		const { channel } = member.voice;

		const player = await this._lavalink.createPlayer({
			guildId: interaction.guild.id,
			textId: interaction.channel.id,
			voiceId: channel.id,
			volume: 50,
			deaf: true,
		});
		player.data.set('previousVolume', 50);

		const result = await this._lavalink.search(song, {
			requester: interaction.user,
		});

		await this._prisma.musicLog
			.create({
				data: {
					guildId: interaction.guildId,
					userId: interaction.user.id,
					query: song,
					result: !result.tracks.length
						? null
						: JSON.stringify(
								result.type === 'PLAYLIST'
									? result?.tracks
									: result?.tracks[0],
						  ),
				},
			})
			.catch(() => null);

		if (!result.tracks.length) {
			return interactionReply(interaction, {
				content: `No results found for query \`${song}\`!`,
			});
		}

		if (result.type === 'PLAYLIST') {
			for (const track of result.tracks) {
				player.queue.add(track);
			}
		} else {
			player.queue.add(result.tracks[0]);
		}

		if (!player.playing && !player.paused) {
			player.play();
		}

		return interactionReply(interaction, {
			content:
				result.type === 'PLAYLIST'
					? `Queued ${result.tracks.length} tracks from \`${result.playlistName}\``
					: `Queued \`${result.tracks[0].title}\``,
		});
	}

	async stop(interaction: MessageComponentInteraction | CommandInteraction) {
		this._logger.verbose(`Stopping song for ${interaction.user.tag}`);

		const player = await this.get(interaction.guildId);

		player.destroy();
		return interactionReply(
			interaction,
			{
				content: 'Player has stopped.',
			},
			false,
		);
	}

	async next(
		interaction: MessageComponentInteraction | CommandInteraction,
		sendMessage = true,
	) {
		this._logger.verbose(`Starting next song for ${interaction.user.tag}`);

		const player = await this.get(interaction.guildId);

		if (!player.queue.size && player.loop === 'none') {
			return interactionReply(interaction, {
				content: 'There is no songs left in queue.',
			});
		}

		player.skip();

		if (sendMessage) {
			return interactionReply(interaction, {
				content: 'Playing next song.',
			});
		}
	}

	async previous(
		interaction: MessageComponentInteraction | CommandInteraction,
		sendMessage = true,
	) {
		this._logger.verbose(
			`Starting previous song for ${interaction.user.tag}`,
		);

		const player = await this.get(interaction.guildId);

		if (!player.queue.previous) {
			return interactionReply(interaction, {
				content: 'There is no previous song.',
			});
		}

		player.play(player.queue.previous, {
			replaceCurrent: true,
		});

		if (sendMessage) {
			return interactionReply(interaction, {
				content: 'Playing previous song.',
			});
		}
	}

	async shuffle(
		interaction: MessageComponentInteraction | CommandInteraction,
		sendMessage = true,
	) {
		this._logger.verbose(`Shuffling queue for ${interaction.user.tag}`);

		const player = await this.get(interaction.guildId);

		player.queue.shuffle();
		player.data.set('shuffled', true);

		await this._lavalink.createPlayerMessage(player, player.queue.current);

		if (sendMessage) {
			return interactionReply(interaction, {
				content: 'Shuffled the queue.',
			});
		}
	}

	async loop(
		interaction: MessageComponentInteraction | CommandInteraction,
		sendMessage = true,
	) {
		this._logger.verbose(`Looping queue for ${interaction.user.tag}`);

		const player = await this.get(interaction.guildId);
		if (player.loop === 'queue') {
			return interactionReply(interaction, {
				content: 'Queue is already looped.',
			});
		}

		player.setLoop('queue');

		await this._lavalink.createPlayerMessage(player, player.queue.current);

		if (sendMessage) {
			return interactionReply(interaction, {
				content: 'Looped the queue.',
			});
		}
	}

	async pause(
		interaction: MessageComponentInteraction | CommandInteraction,
		sendMessage = true,
	) {
		this._logger.verbose(`Pauzing the player for ${interaction.user.tag}`);

		const player = await this.get(interaction.guildId);
		if (player.paused) {
			return interactionReply(interaction, {
				content: 'The player is already paused.',
			});
		}

		player.pause(true);

		await this._lavalink.createPlayerMessage(player, player.queue.current);

		if (sendMessage) {
			return interactionReply(interaction, {
				content: 'Paused the player.',
			});
		}
	}

	async resume(
		interaction: MessageComponentInteraction | CommandInteraction,
		sendMessage = true,
	) {
		this._logger.verbose(`Resuming the player for ${interaction.user.tag}`);

		const player = await this.get(interaction.guildId);

		if (!player.paused) {
			return interactionReply(interaction, {
				content: 'The player is not paused currently.',
			});
		}

		player.pause(false);

		await this._lavalink.createPlayerMessage(player, player.queue.current);

		if (sendMessage) {
			return interactionReply(interaction, {
				content: 'Resumed the player.',
			});
		}
	}

	async setVolume(
		interaction: MessageComponentInteraction | CommandInteraction,
		volume: number,
		sendMessage = true,
		isMute = false,
	) {
		this._logger.verbose(
			`Setting player volume ${interaction.user.tag} to ${volume}`,
		);

		const player = await this.get(interaction.guildId);

		player.data.set('previousVolume', player.volume * 100);
		player.setVolume(volume);

		if (isMute) {
			await this._lavalink.createPlayerMessage(
				player,
				player.queue.current,
			);
		}

		if (
			!sendMessage &&
			interaction instanceof MessageComponentInteraction
		) {
			return interaction.deferUpdate();
		}

		if (sendMessage) {
			return interactionReply(interaction, {
				content: `Current player volume is ${volume}%.`,
			});
		}
	}
}
