import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { User } from 'discord.js';
import { Gauge } from 'prom-client';

import { MusicPlayerService } from '@music';

@Controller()
export class MusicController {
	private readonly _logger = new Logger(MusicController.name);
	constructor(
		private _player: MusicPlayerService,
		@InjectMetric('discord_playing')
		public playing: Gauge<string>
	) {}

	@MessagePattern('MUSIC_STATUS')
	status(
		@Payload()
		{ guildId }: { guildId: string }
	) {
		this._logger.log(`Received status message for ${guildId}`);
		const player = this._player.get(guildId);

		if (!player) {
			return {
				state: -1,
			};
		}

		return {
			state: player.state,
		};
	}

	@MessagePattern('MUSIC_PLAY')
	async start(
		@Payload()
		{
			guildId,
			song,
			voiceChannelId,
			textChannelId,
			author,
		}: {
			guildId: string;
			song: string;
			voiceChannelId: string;
			textChannelId: string;
			author: User;
		}
	) {
		this._logger.log(`Received start message for ${guildId}`);

		const data = await this._player.play(
			guildId,
			song,
			voiceChannelId,
			textChannelId,
			false,
			author
		);
		this.playing.labels('None').inc(1);

		if (!data?.result || data.result !== 'PLAYING') {
			return data;
		}

		if (data.data?.tracks) {
			data.data.tracks = [...data.data.tracks].map(track => {
				delete track.kazagumo;
				return track;
			});
		}

		return data;
	}

	@MessagePattern('MUSIC_STOP')
	stop(
		@Payload()
		{ guildId }: { guildId: string }
	) {
		this._logger.log(`Received stop message for ${guildId}`);
		return this._player.stop(guildId);
	}

	@MessagePattern('MUSIC_NEXT')
	next(
		@Payload()
		{ guildId }: { guildId: string }
	) {
		this._logger.log(`Received next message for ${guildId}`);
		return this._player.next(guildId);
	}

	@MessagePattern('MUSIC_PREVIOUS')
	previous(
		@Payload()
		{ guildId }: { guildId: string }
	) {
		this._logger.log(`Received previous message for ${guildId}`);
		return this._player.previous(guildId);
	}

	@MessagePattern('MUSIC_SHUFFLE')
	shuffle(
		@Payload()
		{ guildId }: { guildId: string }
	) {
		this._logger.log(`Received shuffle message for ${guildId}`);
		return this._player.shuffle(guildId);
	}

	@MessagePattern('MUSIC_LOOP')
	loop(
		@Payload()
		{ guildId }: { guildId: string }
	) {
		this._logger.log(`Received loop message for ${guildId}`);
		return this._player.loop(guildId);
	}

	@MessagePattern('MUSIC_PAUSE')
	pause(
		@Payload()
		{ guildId }: { guildId: string }
	) {
		this._logger.log(`Received pause message for ${guildId}`);
		return this._player.pause(guildId);
	}

	@MessagePattern('MUSIC_RESUME')
	resume(
		@Payload()
		{ guildId }: { guildId: string }
	) {
		this._logger.log(`Received resume message for ${guildId}`);
		return this._player.resume(guildId);
	}

	@MessagePattern('MUSIC_SET_VOLUME')
	setVolume(
		@Payload()
		{
			guildId,
			volume,
			isMute,
		}: {
			guildId: string;
			volume: number;
			isMute?: boolean;
		}
	) {
		this._logger.log(`Received setVolume message for ${guildId}`);
		return this._player.setVolume(guildId, volume, isMute ?? false);
	}

	@MessagePattern('MUSIC_GET_VOLUME')
	getVolume(
		@Payload()
		{ guildId }: { guildId: string }
	) {
		this._logger.log(`Received getVolume message for ${guildId}`);
		return this._player.getVolume(guildId);
	}

	@MessagePattern('MUSIC_QUEUE')
	getQueue(
		@Payload()
		{ guildId, page }: { guildId: string; page: number }
	) {
		this._logger.log(`Received queue message for ${guildId}`);
		return this._player.queue(guildId, page);
	}
}
