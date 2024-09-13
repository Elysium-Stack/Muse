import { Injectable, Logger } from '@nestjs/common';
import { ChannelType, Client, User } from 'discord.js';
import { KazagumoTrack } from 'kazagumo';

import { MusicLavalinkService } from './lavalink.service';

@Injectable()
export class MusicPlayerService {
	private readonly _logger = new Logger(MusicPlayerService.name);

	constructor(
		protected _lavalink: MusicLavalinkService,
		private _client: Client
	) {}

	get(guildId: string) {
		return this._lavalink.players.get(guildId);
	}

	async play(
		guildId: string,
		songOrPlaylist: string,
		voiceChannelId: string,
		textChannelId: string,
		radio = false,
		requester?: User
	) {
		this._logger.verbose(
			`Playing ${radio ? 'radio' : 'song'} for ${guildId}: ${songOrPlaylist}`
		);

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

		const result = await this._lavalink.search(songOrPlaylist, {
			requester,
		});

		if (result.type !== 'PLAYLIST' && radio) {
			return {
				result: 'NO_PLAYLIST',
			};
		}

		if (result.tracks.length === 0) {
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
		player.data.set('radio', radio);
		player.data.set('auto-restart', radio);
		player.data.set('no-dc', process.env['NODE_ENV'] === 'development');

		if (player.queue.size > 0) {
			player.queue.clear();
		}

		for (const track of result.tracks) {
			const transformedTrack = this._transformTrack(track);
			player.queue.add(transformedTrack);
		}

		if (radio) {
			player.setLoop('queue');
			player.queue.shuffle();
			player.data.set('shuffled', true);
		}

		if (!player.playing && !player.paused) {
			player.play();
		}

		return {
			data: result,
			result: 'PLAYING',
		};
	}

	stop(guildId: string) {
		const player = this.get(guildId);

		if (!player) {
			return {
				result: 'NO_PLAYER',
			};
		}

		this._logger.verbose(`Stopping song for ${guildId}`);
		player.data.set('auto-restart', false);
		player.destroy();
		return {
			result: 'STOPPED',
		};
	}

	next(guildId: string) {
		this._logger.verbose(`Starting next song for ${guildId}`);

		const player = this.get(guildId);

		if (!player) {
			return {
				result: 'NO_PLAYER',
			};
		}

		if (player.queue.size === 0 && player.loop === 'none') {
			return {
				result: 'EMPTY_QUEUE',
			};
		}

		player.skip();
		return {
			result: 'NEXT',
		};
	}

	previous(guildId: string) {
		this._logger.verbose(`Starting previous song for ${guildId}`);

		const player = this.get(guildId);

		if (!player) {
			return {
				result: 'NO_PLAYER',
			};
		}

		if (!player.queue.previous) {
			return {
				result: 'NO_PREVIOUS',
			};
		}

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		player.play(player.queue.previous, {
			replaceCurrent: true,
		});
		return {
			result: 'PREVIOUS',
		};
	}

	async shuffle(guildId: string) {
		this._logger.verbose(`Shuffling queue for ${guildId}`);

		const player = this.get(guildId);

		if (!player) {
			return {
				result: 'NO_PLAYER',
			};
		}

		player.queue.shuffle();
		player.data.set('shuffled', true);

		await this._lavalink.createPlayerMessage(player, player.queue.current);

		return {
			result: 'SHUFFLED',
		};
	}

	async loop(guildId: string) {
		this._logger.verbose(`Looping queue for ${guildId}`);

		const player = this.get(guildId);

		if (!player) {
			return {
				result: 'NO_PLAYER',
			};
		}

		if (player.loop === 'queue') {
			player.setLoop('none');
		} else if (player.loop === 'none') {
			player.setLoop('queue');
		}

		await this._lavalink.createPlayerMessage(player, player.queue.current);

		return {
			result: 'LOOPED',
			type: player.loop,
		};
	}

	async pause(guildId: string) {
		this._logger.verbose(`Pauzing the player for ${guildId}`);

		const player = this.get(guildId);

		if (!player) {
			return {
				result: 'NO_PLAYER',
			};
		}

		if (player.paused) {
			return {
				result: 'ALREADY_PAUSED',
			};
		}

		player.pause(true);

		await this._lavalink.createPlayerMessage(player, player.queue.current);
		return {
			result: 'PAUSED',
		};
	}

	async resume(guildId: string) {
		this._logger.verbose(`Resuming the player for ${guildId}`);

		const player = this.get(guildId);

		if (!player) {
			return {
				result: 'NO_PLAYER',
			};
		}

		if (!player.paused) {
			return {
				result: 'NOT_PAUSED',
			};
		}

		player.pause(false);

		await this._lavalink.createPlayerMessage(player, player.queue.current);
		return {
			result: 'RESUMED',
		};
	}

	async setVolume(guildId: string, volume: number, isMute = false) {
		this._logger.verbose(`Setting player volume ${guildId} to ${volume}`);

		const player = this.get(guildId);

		if (!player) {
			return {
				result: 'NO_PLAYER',
			};
		}

		player.data.set('previousVolume', player.volume * 100);
		player.setVolume(volume);

		if (isMute) {
			await this._lavalink.createPlayerMessage(player, player.queue.current);
		}

		return {
			result: 'VOLUME_SET',
			volume,
			isMute,
		};
	}

	getVolume(guildId: string) {
		this._logger.verbose(`Getting player volume for ${guildId}`);

		const player = this.get(guildId);

		if (!player) {
			return {
				result: 'NO_PLAYER',
			};
		}

		return {
			result: 'VOLUME_GET',
			volume: player.volume,
		};
	}

	queue(guildId: string, page: number) {
		this._logger.verbose(`Getting player queue for ${guildId}`);

		const player = this.get(guildId);

		if (!player) {
			return {
				result: 'NO_PLAYER',
			};
		}

		const current = player.queue.current;

		if (current) {
			delete current.kazagumo;
		}

		return {
			result: 'QUEUE',
			queue: [...player.queue].slice((page - 1) * 10, page * 10),
			current,
			total: player.queue.totalSize,
		};
	}

	private _transformTrack(track: KazagumoTrack) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const transformedTrack = new KazagumoTrack(
			track.getRaw()._raw,
			track.requester
		);
		transformedTrack.thumbnail = track.thumbnail;

		return transformedTrack;
	}
}
