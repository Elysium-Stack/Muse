import {
	Inject,
	Injectable,
	Logger,
	OnModuleInit,
	Optional,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Cron } from '@nestjs/schedule';
import { PlayerState } from 'kazagumo';
import { firstValueFrom, take, timeout } from 'rxjs';

import { PrismaService } from '@prisma';

@Injectable()
export class MusicInstancesService implements OnModuleInit {
	private readonly _logger = new Logger(MusicInstancesService.name);

	private _instances: ClientProxy[] = [];

	constructor(
		private _prisma: PrismaService,
		@Optional() @Inject('MUSIC_SERVICE_1') private _music: ClientProxy,
		@Optional() @Inject('MUSIC_SERVICE_2') private _music2: ClientProxy,
		@Optional() @Inject('MUSIC_SERVICE_3') private _music3: ClientProxy
	) {
		this._instances.push(this._music, this._music2, this._music3);
	}

	onModuleInit() {
		setTimeout(() => this._checkInstances(), 2000);
	}

	async getAvailableOrExisting(guildId: string, voiceChannelId: string) {
		const exists = await this.getByVoiceId(guildId, voiceChannelId);
		if (exists) {
			return exists;
		}

		const all = await this._prisma.musicServiceMap.findMany({
			where: {
				guildId,
			},
		});

		if (all.length === this._instances.length) {
			return null;
		}

		const available: number[] = this._instances
			.filter(i => !!i)
			.map((_, i) => i + 1);
		for (const entry of all) {
			const index = available.indexOf(entry.instance);
			available.splice(index, 1);
		}

		if (available.length === 0) {
			return null;
		}

		return available[0];
	}

	async getByVoiceId(guildId: string, voiceChannelId: string) {
		const current = await this._prisma.musicServiceMap.findFirst({
			where: {
				guildId,
				voiceChannelId,
			},
		});

		if (!current) {
			return null;
		}

		return current.instance;
	}

	get(instance: number) {
		if (instance < 1) {
			instance = 1;
		}

		return this._instances[instance - 1];
	}

	async connect(instance: number, guildId: string, voiceChannelId: string) {
		await this.disconnect(instance, guildId);

		const result = await this.sendCommand<{ state: number }>(
			instance,
			'MUSIC_STATUS',
			{
				guildId,
			}
		);

		await this._prisma.musicServiceMap.create({
			data: {
				guildId,
				voiceChannelId,
				state: result.state,
				instance,
			},
		});
	}

	async disconnect(instance: number, guildId: string) {
		const hasOne = await this._prisma.musicServiceMap.findFirst({
			where: {
				guildId,
				instance,
			},
		});

		if (hasOne) {
			await this._prisma.musicServiceMap.delete({
				where: {
					id: hasOne.id,
				},
			});
		}
	}

	async clearInstance(instance: number) {
		await this._prisma.musicServiceMap.deleteMany({
			where: {
				instance,
			},
		});
	}

	async sendCommand<T>(instance: number, command: string, data: unknown) {
		const _instance = this.get(instance);

		if (!_instance) {
			return null;
		}

		try {
			const result = await (firstValueFrom(
				_instance.send(command, data).pipe(take(1), timeout(5000))
			) as Promise<T & { result: string }>);

			return result;
		} catch (error) {
			this._logger.error(error);
			return null;
		}
	}

	async updateState(instance: number, guildId: string, state: PlayerState) {
		const entry = await this._prisma.musicServiceMap.findFirst({
			where: {
				instance,
				guildId,
			},
		});

		if (!entry) {
			return null;
		}

		return this._prisma.musicServiceMap.update({
			where: {
				id: entry.id,
			},
			data: {
				state,
			},
		});
	}

	@Cron('0 */10 * * * *')
	protected async _checkInstances() {
		this._logger.log('Checking alive instances');
		const unfinished = await this._prisma.musicServiceMap.findMany();

		for (const entry of unfinished) {
			const result = await this.sendCommand<{ state: number }>(
				entry.instance,
				'MUSIC_STATUS',
				{
					guildId: entry.guildId,
				}
			).catch(() => null);

			if (
				!result ||
				[
					PlayerState.DISCONNECTED,
					PlayerState.DISCONNECTING,
					PlayerState.DESTROYING,
					PlayerState.DESTROYED,
					-1,
				].includes(result.state)
			) {
				this.disconnect(entry.instance, entry.guildId);
			}
		}
	}
}
