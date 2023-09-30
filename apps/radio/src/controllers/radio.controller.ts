import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RadioService } from '../services/radio.service';

@Controller()
export class RadioController {
	private readonly _logger = new Logger(RadioController.name);
	constructor(private _radio: RadioService) {}

	@MessagePattern('RADIO_START')
	start(
		@Payload()
		{
			guildId,
			radioPlaylist,
			radioVoiceChannelId,
			radioTextChannelId,
		}: {
			guildId: string;
			radioPlaylist: string;
			radioVoiceChannelId: string;
			radioTextChannelId: string;
		},
	) {
		this._logger.log(`Received start message for ${guildId}`);
		return this._radio.start(
			guildId,
			radioPlaylist,
			radioVoiceChannelId,
			radioTextChannelId,
		);
	}

	@MessagePattern('RADIO_STOP')
	stop(
		@Payload()
		{ guildId }: { guildId: string },
	) {
		this._logger.log(`Received stop message for ${guildId}`);
		return this._radio.stop(guildId);
	}

	@MessagePattern('RADIO_NEXT')
	next(
		@Payload()
		{ guildId }: { guildId: string },
	) {
		this._logger.log(`Received next message for ${guildId}`);
		return this._radio.next(guildId);
	}

	@MessagePattern('RADIO_PREVIOUS')
	previous(
		@Payload()
		{ guildId }: { guildId: string },
	) {
		this._logger.log(`Received pervious message for ${guildId}`);
		return this._radio.previous(guildId);
	}

	@MessagePattern('RADIO_QUEUE')
	async getQueue(
		@Payload()
		{
			guildId,
			page,
		}: {
			guildId: string;
			voiceChannelId: string;
			page: number;
		},
	) {
		this._logger.log(`Received queue message for ${guildId}`);
		const data = await this._radio.queue(guildId, page);
		console.log(data);
		return data;
	}
}
