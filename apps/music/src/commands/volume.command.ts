import {
	HasNoPlayerExceptionFilter,
	MusicCommandDecorator,
	MusicHasPlayerGuard,
	MusicInVoiceGuard,
	NotInVoiceExceptionFilter,
	getVoiceChannelFromInteraction,
} from '@music';
import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import { Button, ButtonContext, ComponentParam, Context } from 'necord';
import { MusicService } from '../services';

@UseGuards(MusicInVoiceGuard, MusicHasPlayerGuard)
@UseFilters(NotInVoiceExceptionFilter, HasNoPlayerExceptionFilter)
@MusicCommandDecorator()
export class MusicVolumeCommands {
	private readonly _logger = new Logger(MusicVolumeCommands.name);

	constructor(private _music: MusicService) {}

	@Button('MUSIC_VOLUME_SET/:volume/:isMute')
	public async onSetButton(
		@Context()
		[interaction]: ButtonContext,
		@ComponentParam('volume') volume: string | number,
		@ComponentParam('isMute') isMute: string,
	) {
		if (typeof volume === 'string') {
			volume = parseInt(volume, 10);
		}

		const channel = await getVoiceChannelFromInteraction(interaction);
		if (!channel) {
			return interaction.deferUpdate();
		}

		await this._music.setVolume(
			null,
			interaction.guildId,
			channel.id,
			volume,
			isMute === 'true' ? true : false,
		);
		return interaction.deferUpdate();
	}

	@Button('MUSIC_VOLUME_INCREASE/:amount')
	public async onIncreaseButton(
		@Context()
		[interaction]: ButtonContext,
		@ComponentParam('amount') amount: string | number,
	) {
		if (typeof amount === 'string') {
			amount = parseInt(amount, 10);
		}

		const channel = await getVoiceChannelFromInteraction(interaction);
		if (!channel) {
			return interaction.deferUpdate();
		}

		const { result, volume } = await this._music.getVolume(
			null,
			interaction.guildId,
			channel.id,
		);

		if (result === 'NO_PLAYER') {
			return interaction.deferUpdate();
		}

		const current = volume * 100;

		let newVolume = current + amount;
		if (newVolume > 100) {
			newVolume = 100;
		}

		await this._music.setVolume(
			null,
			interaction.guildId,
			channel.id,
			newVolume,
			false,
		);
		return interaction.deferUpdate();
	}

	@Button('MUSIC_VOLUME_DECREASE/:amount')
	public async onDecreaseButton(
		@Context()
		[interaction]: ButtonContext,
		@ComponentParam('amount') amount: string | number,
	) {
		if (typeof amount === 'string') {
			amount = parseInt(amount, 10);
		}

		const channel = await getVoiceChannelFromInteraction(interaction);
		if (!channel) {
			return interaction.deferUpdate();
		}

		const { result, volume } = await this._music.getVolume(
			null,
			interaction.guildId,
			channel.id,
		);

		if (result === 'NO_PLAYER') {
			return interaction.deferUpdate();
		}

		const current = volume * 100;

		let newVolume = current - amount;
		if (newVolume < 0) {
			newVolume = 0;
		}

		await this._music.setVolume(
			null,
			interaction.guildId,
			channel.id,
			newVolume,
			false,
		);
		return interaction.deferUpdate();
	}
}
