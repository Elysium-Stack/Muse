import {
	HasNoPlayerExceptionFilter,
	MusicCommandDecorator,
	MusicHasPlayerGuard,
	MusicInVoiceGuard,
	MusicPlayerService,
	NotInVoiceExceptionFilter,
} from '@music';
import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import { Button, ButtonContext, ComponentParam, Context } from 'necord';

@UseGuards(MusicInVoiceGuard, MusicHasPlayerGuard)
@UseFilters(NotInVoiceExceptionFilter, HasNoPlayerExceptionFilter)
@MusicCommandDecorator()
export class MusicVolumeCommands {
	private readonly _logger = new Logger(MusicVolumeCommands.name);

	constructor(private _player: MusicPlayerService) {}

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

		await this._player.setVolume(
			interaction.guildId,
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

		const { result, volume } = await this._player.getVolume(
			interaction.guildId,
		);

		if (result === 'NO_PLAYER') {
			return interaction.deferUpdate();
		}

		const current = volume * 100;

		let newVolume = current + amount;
		if (newVolume > 100) {
			newVolume = 100;
		}

		await this._player.setVolume(interaction.guildId, newVolume, false);
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

		const { result, volume } = await this._player.getVolume(
			interaction.guildId,
		);

		if (result === 'NO_PLAYER') {
			return interaction.deferUpdate();
		}

		const current = volume * 100;

		let newVolume = current - amount;
		if (newVolume < 0) {
			newVolume = 0;
		}

		await this._player.setVolume(interaction.guildId, newVolume, false);
		return interaction.deferUpdate();
	}
}
