import { MusicPlayerService } from '@music';
import { Injectable, Logger } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { PrismaService } from '@prisma';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Gauge } from 'prom-client';

@Injectable()
export class MusicService {
	private readonly _logger = new Logger(MusicService.name);

	constructor(
		private _prisma: PrismaService,
		private _player: MusicPlayerService,

		@InjectMetric('discord_playing')
		public playing: Gauge<string>,
	) {}

	async play(
		ctx: RmqContext,
		guildId: string,
		song: string,
		voiceChannelId: string,
		textChannelId: string,
	) {
		const player = this._getPlayer(ctx, guildId, voiceChannelId);

		if (player) {
			this.playing.labels('None').dec(1);
			player.destroy();
		}

		// await this._prisma.musicLog.deleteMany({
		// 	where: {
		// 		guildId,
		// 	},
		// });

		const data = await this._player.play(
			guildId,
			song!,
			voiceChannelId!,
			textChannelId,
		);
		this.playing.labels('None').inc(1);

		if (!data?.result || data.result !== 'PLAYING') {
			return data;
		}

		// await this._prisma.musicLog.create({
		// 	data: {
		// 		guildId,
		// 	},
		// });

		if (data.data?.tracks) {
			data.data.tracks = [...data.data?.tracks].map((track) => {
				delete track.kazagumo;
				return track;
			});
		}

		return data;
	}

	async stop(ctx: RmqContext, guildId: string, voiceChannelId: string) {
		const player = this._getPlayer(ctx, guildId, voiceChannelId);
		if (!player) {
			return {
				result: 'NO_PLAYER',
			};
		}

		this.playing.labels('None').dec(1);
		return this._player.stop(guildId);
	}

	async next(ctx: RmqContext, guildId: string, voiceChannelId: string) {
		const player = this._getPlayer(ctx, guildId, voiceChannelId);
		if (!player) {
			return {
				result: 'NO_PLAYER',
			};
		}

		return this._player.next(guildId);
	}

	async previous(ctx: RmqContext, guildId: string, voiceChannelId: string) {
		const player = this._getPlayer(ctx, guildId, voiceChannelId);
		if (!player) {
			return {
				result: 'NO_PLAYER',
			};
		}

		return this._player.previous(guildId);
	}

	async shuffle(ctx: RmqContext, guildId: string, voiceChannelId: string) {
		const player = this._getPlayer(ctx, guildId, voiceChannelId);
		if (!player) {
			return {
				result: 'NO_PLAYER',
			};
		}

		return this._player.shuffle(guildId);
	}

	async loop(ctx: RmqContext, guildId: string, voiceChannelId: string) {
		const player = this._getPlayer(ctx, guildId, voiceChannelId);
		if (!player) {
			return {
				result: 'NO_PLAYER',
			};
		}

		return this._player.loop(guildId);
	}

	async pause(ctx: RmqContext, guildId: string, voiceChannelId: string) {
		const player = this._getPlayer(ctx, guildId, voiceChannelId);
		if (!player) {
			return {
				result: 'NO_PLAYER',
			};
		}

		return this._player.pause(guildId);
	}

	async resume(ctx: RmqContext, guildId: string, voiceChannelId: string) {
		const player = this._getPlayer(ctx, guildId, voiceChannelId);
		if (!player) {
			return {
				result: 'NO_PLAYER',
			};
		}

		return this._player.resume(guildId);
	}

	async setVolume(
		ctx: RmqContext,
		guildId: string,
		voiceChannelId: string,
		volume: number,
		isMute = false,
	) {
		const player = this._getPlayer(ctx, guildId, voiceChannelId);
		if (!player) {
			return {
				result: 'NO_PLAYER',
			};
		}

		return this._player.setVolume(guildId, volume, isMute);
	}

	async getVolume(ctx: RmqContext, guildId: string, voiceChannelId: string) {
		const player = this._getPlayer(ctx, guildId, voiceChannelId);
		if (!player) {
			return {
				result: 'NO_PLAYER',
				volume: 0,
			};
		}

		return this._player.getVolume(guildId);
	}

	async queue(
		ctx: RmqContext,
		guildId: string,
		voiceChannelId: string,
		page: number,
	) {
		const player = this._getPlayer(ctx, guildId, voiceChannelId);
		if (!player) {
			return {
				result: 'NO_PLAYER',
			};
		}

		return this._player.queue(guildId, page);
	}

	private _getPlayer(
		ctx: RmqContext,
		guildId: string,
		voiceChannelId: string,
	) {
		const player = this._player.get(guildId);

		let channel, originalMsg;

		if (ctx) {
			channel = ctx.getChannelRef();
			originalMsg = ctx.getMessage();
		}

		if (player && player.voiceId !== voiceChannelId) {
			if (ctx && channel && originalMsg) {
				channel.nack(originalMsg, false, true);
			}

			return;
		}

		if (ctx && channel && originalMsg) {
			channel.ack(originalMsg);
		}

		return player;
	}
}
