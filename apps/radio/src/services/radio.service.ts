import { MusicPlayerService } from '@muse/music';
import { PrismaService } from '@muse/prisma';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RadioService {
	private readonly _logger = new Logger(RadioService.name);

	constructor(
		private _prisma: PrismaService,
		private _player: MusicPlayerService,
	) {}

	async startWithoutConfig(guildId: string) {
		const settings = await this._prisma.settings.findUnique({
			where: {
				guildId,
			},
		});

		if (
			!settings ||
			!settings.radioPlaylist ||
			!settings.radioVoiceChannelId
		) {
			return;
		}

		const { radioPlaylist, radioVoiceChannelId, radioTextChannelId } =
			settings;

		return this.start(
			guildId,
			radioPlaylist,
			radioVoiceChannelId,
			radioTextChannelId,
		);
	}

	async start(
		guildId: string,
		radioPlaylist: string,
		radioVoiceChannelId: string,
		radioTextChannelId: string,
	) {
		const player = this._player.get(guildId);
		if (player) {
			player.destroy();
		}

		await this._prisma.radioLog.deleteMany({
			where: {
				guildId,
			},
		});

		const data = await this._player.radio(
			guildId,
			radioPlaylist!,
			radioVoiceChannelId!,
			radioTextChannelId,
		);

		if (!data?.result || data.result !== 'PLAYING') {
			return data;
		}

		await this._prisma.radioLog.create({
			data: {
				guildId,
			},
		});

		if (data.data?.tracks) {
			data.data.tracks = [...data.data?.tracks].map((track) => {
				delete track.kazagumo;
				return track;
			});
		}

		return data;
	}

	async stop(guildId: string) {
		await this._player.stop(null, guildId);

		await this._prisma.radioLog.deleteMany({
			where: {
				guildId,
			},
		});

		return {
			result: 'STOPPED',
		};
	}

	async next(guildId: string) {
		const player = await this._player.get(guildId);

		if (!player) {
			return {
				result: 'NOT_PLAYING',
			};
		}

		player.skip();

		return {
			result: 'NEXT',
		};
	}

	async previous(guildId: string) {
		const player = await this._player.get(guildId);

		if (!player) {
			return {
				result: 'NOT_PLAYING',
			};
		}

		if (!player.queue.previous) {
			return {
				result: 'NO_PREVIOUS',
			};
		}

		player.play(player.queue.previous, {
			replaceCurrent: true,
		});

		return {
			result: 'PREVIOUS',
		};
	}
}
