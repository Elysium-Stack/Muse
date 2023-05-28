import { interactionReply } from '@muse/util';
import { Injectable, Logger } from '@nestjs/common';
import {
	ChannelType,
	Client,
	CommandInteraction,
	MessageComponentInteraction,
} from 'discord.js';
import { MusicLavalinkService } from './lavalink.service';

@Injectable()
export class MusicPlayerService {
	private readonly _logger = new Logger(MusicPlayerService.name);

	constructor(
		protected _lavalink: MusicLavalinkService,
		private _client: Client,
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

		await interaction.deferReply();

		const member = await interaction.guild!.members.fetch(
			interaction.user.id,
		);
		const { channel } = member.voice;

		if (!channel) {
			return;
		}

		const result = await this._lavalink.search(song, {
			requester: interaction.user,
		});

		if (!result.tracks.length) {
			return {
				result,
				reply: await interactionReply(interaction, {
					content: `No results found for query \`${song}\`!`,
				}),
			};
		}

		const player = await this._lavalink.createPlayer({
			guildId: interaction.guild!.id,
			textId: interaction.channel!.id,
			voiceId: channel.id,
			volume: 50,
			deaf: true,
		});
		player.data.set('previousVolume', 50);

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

		const reply = await interactionReply(interaction, {
			content:
				result.type === 'PLAYLIST'
					? `Queued ${result.tracks.length} tracks from \`${result.playlistName}\``
					: `Queued \`${result.tracks[0].title}\``,
		});

		return {
			reply,
			result,
		};
	}

	async radio(
		guildId: string,
		playlist: string,
		voiceChannelId: string,
		textChannelId: string,
	) {
		this._logger.verbose(`Starting radio for ${guildId}: ${playlist}`);

		const guild = await this._client.guilds.fetch(guildId);

		if (!guild) {
			return {
				result: 'GUILD_NOT_FOUND',
			};
		}

		const voiceChannel = await guild.channels.fetch(voiceChannelId);

		if (!voiceChannel || voiceChannel.type !== ChannelType.GuildVoice) {
			return {
				result: 'NO_VOICE_CHANNEL',
			};
		}

		const result = await this._lavalink.search(playlist);

		if (result.type !== 'PLAYLIST') {
			return {
				result: 'NO_PLAYLIST',
			};
		}

		if (!result.tracks.length) {
			return {
				result: 'NO_TRACKS_FOUND',
			};
		}

		const player = await this._lavalink.createPlayer({
			guildId: guildId,
			textId: textChannelId,
			voiceId: voiceChannel.id,
			volume: 50,
			deaf: true,
		});
		player.data.set('previousVolume', 50);
		player.data.set('radio', true);

		if (player.queue.size > 0) {
			player.queue.clear();
		}

		for (const track of result.tracks) {
			player.queue.add(track);
		}

		player.setLoop('queue');
		player.queue.shuffle();
		player.data.set('shuffled', true);

		if (!player.playing && !player.paused) {
			player.play();
		}

		return {
			data: {
				tracks: result.tracks,
				voiceChannelId,
				playlistName: result.playlistName,
			},
			result: 'PLAYING',
		};
	}

	async stop(
		interaction: MessageComponentInteraction | CommandInteraction | null,
		guildId?: string,
	) {
		this._logger.verbose(
			`Stopping song for ${interaction?.user.tag ?? guildId}`,
		);

		if (!guildId && !interaction?.guildId) {
			return;
		}

		const player = await this.get(guildId ?? interaction!.guildId!);

		if (!player) {
			return;
		}

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

		const player = await this.get(interaction.guildId!);

		if (!player) {
			return;
		}

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

		const player = await this.get(interaction.guildId!);

		if (!player) {
			return;
		}

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

		const player = await this.get(interaction.guildId!);

		if (!player) {
			return;
		}

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

		const player = await this.get(interaction.guildId!);

		if (!player) {
			return;
		}

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

		const player = await this.get(interaction.guildId!);

		if (!player) {
			return;
		}

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

		const player = await this.get(interaction.guildId!);

		if (!player?.paused) {
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

		const player = await this.get(interaction.guildId!);

		if (!player) {
			return;
		}

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
