import { LavalinkMusicEvent } from '@music/util';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class MusicEvents implements OnModuleInit {
	private readonly _logger = new Logger(MusicEvents.name);

	constructor(@Inject('MUSE_SERVICE') private _muse: ClientProxy) {}

	onModuleInit() {
		this._muse.emit('MUSIC_INSTANCE_BOOTED', {
			instance: Number.parseInt(process.env.INSTANCE_NUMBER),
		});
	}

	@OnEvent('music.connected')
	async handleMusicConnected({ player }: LavalinkMusicEvent) {
		this._logger.log('Informing muse we connected');
		this._muse.emit('MUSIC_CONNECTED', {
			instance: Number.parseInt(process.env.INSTANCE_NUMBER),
			guildId: player.guildId,
			voiceChannelId: player.voiceId,
		});
	}

	@OnEvent('music.state')
	async handleMusicStateChange({ player }: LavalinkMusicEvent) {
		this._logger.log('Informing muse we changed state');
		this._muse.emit('MUSIC_STATE_CHANGED', {
			instance: Number.parseInt(process.env.INSTANCE_NUMBER),
			guildId: player.guildId,
			state: player.state,
		});
	}

	@OnEvent('music.disconnected')
	handleMusicDisconnected({ player }: LavalinkMusicEvent) {
		this._logger.log('Informing muse we disconnected');
		this._muse.emit('MUSIC_DISCONNECTED', {
			instance: Number.parseInt(process.env.INSTANCE_NUMBER),
			guildId: player.guildId,
			voiceChannelId: player.voiceId,
		});
	}
}
