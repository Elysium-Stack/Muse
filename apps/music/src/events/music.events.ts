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
			instance: parseInt(process.env.INSTANCE_NUMBER),
		});
	}

	@OnEvent('music.connected')
	async handleMusicConnected(data: LavalinkMusicEvent) {
		this._logger.log('Informing muse we connected');
		this._muse.emit('MUSIC_CONNECTED', {
			instance: parseInt(process.env.INSTANCE_NUMBER),
			guildId: data.guildId,
			voiceChannelId: data.voiceChannelId,
		});
	}

	@OnEvent('music.state')
	async handleMusicStateChange(data: LavalinkMusicEvent) {
		this._logger.log('Informing muse we changed state');
		this._muse.emit('MUSIC_STATE_CHANGED', {
			instance: parseInt(process.env.INSTANCE_NUMBER),
			guildId: data.guildId,
			state: data.state,
		});
	}

	@OnEvent('music.disconnected')
	handleMusicDisconnected(data: LavalinkMusicEvent) {
		this._logger.log('Informing muse we disconnected');
		this._muse.emit('MUSIC_DISCONNECTED', {
			instance: parseInt(process.env.INSTANCE_NUMBER),
			guildId: data.guildId,
			voiceChannelId: data.voiceChannelId,
		});
	}
}
