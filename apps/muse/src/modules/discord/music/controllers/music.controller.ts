import { LavalinkMusicEvent } from '@music';
import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PlayerState } from 'kazagumo';
import { MusicInstancesService } from '../services/instances.service';

@Controller()
export class MusicController {
	private readonly _logger = new Logger(MusicController.name);

	constructor(private _instances: MusicInstancesService) {}

	@EventPattern('MUSIC_INSTANCE_BOOTED')
	booted(
		@Payload()
		{ instance }: { instance: number },
	) {
		this._logger.log(`Music instance booted up ${instance}`);
		this._instances.clearInstance(instance);
	}

	@EventPattern('MUSIC_STATE_CHANGED')
	stateChanged(
		@Payload()
		{
			instance,
			guildId,
			state,
		}: {
			instance: number;
			guildId: string;
			state: PlayerState;
		},
	) {
		this._logger.log(`Music instance state changed ${instance} - ${state}`);
		this._instances.updateState(instance, guildId, state);
	}

	@EventPattern('MUSIC_CONNECTED')
	connected(
		@Payload()
		{
			instance,
			guildId,
			voiceChannelId,
		}: { instance: number } & LavalinkMusicEvent,
	) {
		this._logger.log(`Received music connected message for ${instance}`);
		this._instances.connect(instance, guildId, voiceChannelId);
	}

	@EventPattern('MUSIC_DISCONNECTED')
	disconnected(
		@Payload()
		{ instance, guildId }: { instance: number } & LavalinkMusicEvent,
	) {
		this._logger.log(`Received music disconnected message for ${instance}`);
		this._instances.disconnect(instance, guildId);
	}
}
