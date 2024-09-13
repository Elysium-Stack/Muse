import { MusicPlayerService } from '@music';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@prisma';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Gauge } from 'prom-client';

@Injectable()
export class RadioService {
	private readonly _logger = new Logger(RadioService.name);

	constructor(
		private _prisma: PrismaService,
		private _player: MusicPlayerService,

		@InjectMetric('discord_playing')
		public playing: Gauge<string>
	) {}

	async startWithoutConfig(guildId: string) {
		const settings = await this._prisma.settings.findUnique({
			where: {
				guildId,
			},
		});

		if (!settings || !settings.radioPlaylist || !settings.radioVoiceChannelId) {
			return;
		}

		const { radioPlaylist, radioVoiceChannelId, radioTextChannelId } = settings;

		return this.start(
			guildId,
			radioPlaylist,
			radioVoiceChannelId,
			radioTextChannelId
		);
	}

	async start(
		guildId: string,
		radioPlaylist: string,
		radioVoiceChannelId: string,
		radioTextChannelId: string
	) {
		const player = this._player.get(guildId);
		if (player) {
			this.playing.labels('None').dec(1);
			player.destroy();
		}

		await this._prisma.radioLog.deleteMany({
			where: {
				guildId,
			},
		});

		const data = await this._player.play(
			guildId,
			radioPlaylist!,
			radioVoiceChannelId!,
			radioTextChannelId,
			true
		);
		this.playing.labels('None').inc(1);

		if (!data?.result || data.result !== 'PLAYING') {
			return data;
		}

		await this._prisma.radioLog.create({
			data: {
				guildId,
			},
		});

		if (data.data?.tracks) {
			data.data.tracks = [...data.data?.tracks].map(track => {
				delete track.kazagumo;
				return track;
			});
		}

		return data;
	}

	async stop(guildId: string) {
		const data = await this._player.stop(guildId);

		if (data.result === 'STOPPED') {
			this.playing.labels('None').dec(1);
		}

		return data;
	}

	async next(guildId: string) {
		return this._player.next(guildId);
	}

	async previous(guildId: string) {
		return this._player.previous(guildId);
	}

	async queue(guildId: string, page: number) {
		return this._player.queue(guildId, page);
	}
}
