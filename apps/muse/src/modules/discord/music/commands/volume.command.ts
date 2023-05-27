import { EnabledExceptionFilter } from '@muse/filters';
import {
	HasNoPlayerExceptionFilter,
	MusicHasPlayerGuard,
	MusicInVoiceGuard,
	MusicPlayerService,
	NotInVoiceExceptionFilter,
} from '@muse/music';
import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import {
	Button,
	ButtonContext,
	ComponentParam,
	Context,
	NumberOption,
	Options,
	SlashCommandContext,
	Subcommand,
} from 'necord';
import { MusicEnabledGuard } from '../guards/enabled.guard';
import { MusicCommandDecorator } from '../music.decorator';

class MusicVolumeOptions {
	@NumberOption({
		name: 'volume',
		description: 'The volume to set the player at',
		required: true,
		min_value: 0,
		max_value: 100,
	})
	volume: number | undefined;
}

@UseGuards(MusicEnabledGuard, MusicInVoiceGuard, MusicHasPlayerGuard)
@UseFilters(
	EnabledExceptionFilter,
	NotInVoiceExceptionFilter,
	HasNoPlayerExceptionFilter,
)
@MusicCommandDecorator()
export class MusicVolumeCommands {
	private readonly _logger = new Logger(MusicVolumeCommands.name);

	constructor(private _player: MusicPlayerService) {}

	@Subcommand({
		name: 'volume',
		description: 'Pause the current player',
	})
	public async pause(
		@Context() [interaction]: SlashCommandContext,
		@Options() { volume }: MusicVolumeOptions,
	) {
		return this._player.setVolume(interaction, volume!);
	}

	@Button('MUSIC_VOLUME_SET/:volume/:isMute')
	public onSetButton(
		@Context()
		[interaction]: ButtonContext,
		@ComponentParam('volume') volume: string | number,
		@ComponentParam('isMute') isMute: string,
	) {
		if (typeof volume === 'string') {
			volume = parseInt(volume, 10);
		}
		return this._player.setVolume(
			interaction,
			volume,
			false,
			isMute === 'true' ? true : false,
		);
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
		const player = await this._player.get(interaction.guildId!);

		if (!player) {
			return;
		}

		const current = player.volume * 100;

		let newVolume = current + amount;
		if (newVolume > 100) {
			newVolume = 100;
		}

		return this._player.setVolume(interaction, newVolume, false);
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

		const player = await this._player.get(interaction.guildId!);

		if (!player) {
			return;
		}

		const current = player.volume * 100;

		let newVolume = current - amount;
		if (newVolume < 0) {
			newVolume = 0;
		}

		return this._player.setVolume(interaction, newVolume, false);
	}
}
