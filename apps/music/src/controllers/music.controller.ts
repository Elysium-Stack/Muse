import { Controller, Logger } from '@nestjs/common';
import {
	Ctx,
	MessagePattern,
	Payload,
	RmqContext,
} from '@nestjs/microservices';
import { MusicService } from '../services/music.service';

@Controller()
export class MusicController {
	private readonly _logger = new Logger(MusicController.name);
	constructor(private _music: MusicService) {}

	@MessagePattern('MUSIC_PLAY')
	start(
		@Payload()
		{
			guildId,
			song,
			voiceChannelId,
			textChannelId,
		}: {
			guildId: string;
			song: string;
			voiceChannelId: string;
			textChannelId: string;
		},
		@Ctx() ctx: RmqContext,
	) {
		this._logger.log(`Received start message for ${guildId}`);
		return this._music.play(
			ctx,
			guildId,
			song,
			voiceChannelId,
			textChannelId,
		);
	}

	@MessagePattern('MUSIC_STOP')
	stop(
		@Payload()
		{
			guildId,
			voiceChannelId,
		}: {
			guildId: string;
			voiceChannelId: string;
		},
		@Ctx() ctx: RmqContext,
	) {
		this._logger.log(`Received stop message for ${guildId}`);
		return this._music.stop(ctx, guildId, voiceChannelId);
	}

	@MessagePattern('MUSIC_NEXT')
	next(
		@Payload()
		{
			guildId,
			voiceChannelId,
		}: {
			guildId: string;
			voiceChannelId: string;
		},
		@Ctx() ctx: RmqContext,
	) {
		this._logger.log(`Received next message for ${guildId}`);
		return this._music.next(ctx, guildId, voiceChannelId);
	}

	@MessagePattern('MUSIC_PREVIOUS')
	previous(
		@Payload()
		{
			guildId,
			voiceChannelId,
		}: {
			guildId: string;
			voiceChannelId: string;
		},
		@Ctx() ctx: RmqContext,
	) {
		this._logger.log(`Received previous message for ${guildId}`);
		return this._music.previous(ctx, guildId, voiceChannelId);
	}

	@MessagePattern('MUSIC_SHUFFLE')
	shuffle(
		@Payload()
		{
			guildId,
			voiceChannelId,
		}: {
			guildId: string;
			voiceChannelId: string;
		},
		@Ctx() ctx: RmqContext,
	) {
		this._logger.log(`Received shuffle message for ${guildId}`);
		return this._music.shuffle(ctx, guildId, voiceChannelId);
	}

	@MessagePattern('MUSIC_LOOP')
	loop(
		@Payload()
		{
			guildId,
			voiceChannelId,
		}: {
			guildId: string;
			voiceChannelId: string;
		},
		@Ctx() ctx: RmqContext,
	) {
		this._logger.log(`Received loop message for ${guildId}`);
		return this._music.loop(ctx, guildId, voiceChannelId);
	}

	@MessagePattern('MUSIC_PAUSE')
	pause(
		@Payload()
		{
			guildId,
			voiceChannelId,
		}: {
			guildId: string;
			voiceChannelId: string;
		},
		@Ctx() ctx: RmqContext,
	) {
		this._logger.log(`Received pause message for ${guildId}`);
		return this._music.pause(ctx, guildId, voiceChannelId);
	}

	@MessagePattern('MUSIC_RESUME')
	resume(
		@Payload()
		{
			guildId,
			voiceChannelId,
		}: {
			guildId: string;
			voiceChannelId: string;
		},
		@Ctx() ctx: RmqContext,
	) {
		this._logger.log(`Received resume message for ${guildId}`);
		return this._music.resume(ctx, guildId, voiceChannelId);
	}

	@MessagePattern('MUSIC_SET_VOLUME')
	setVolume(
		@Payload()
		{
			guildId,
			voiceChannelId,
			volume,
			isMute,
		}: {
			guildId: string;
			voiceChannelId: string;
			volume: number;
			isMute?: boolean;
		},
		@Ctx() ctx: RmqContext,
	) {
		this._logger.log(`Received setVolume message for ${guildId}`);
		return this._music.setVolume(
			ctx,
			guildId,
			voiceChannelId,
			volume,
			isMute ?? false,
		);
	}

	@MessagePattern('MUSIC_GET_VOLUME')
	getVolume(
		@Payload()
		{
			guildId,
			voiceChannelId,
		}: {
			guildId: string;
			voiceChannelId: string;
		},
		@Ctx() ctx: RmqContext,
	) {
		this._logger.log(`Received getVolume message for ${guildId}`);
		return this._music.getVolume(ctx, guildId, voiceChannelId);
	}
}
