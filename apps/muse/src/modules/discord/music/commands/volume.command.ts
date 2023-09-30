import {
	MusicCommandDecorator,
	MusicInVoiceGuard,
	NotInVoiceExceptionFilter,
} from '@music';
import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import { EnabledExceptionFilter } from '@util';
import {
	Context,
	NumberOption,
	Options,
	SlashCommandContext,
	Subcommand,
} from 'necord';
import { MusicEnabledGuard } from '../guards/enabled.guard';
import { MusicService } from '../services';

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

@UseGuards(MusicEnabledGuard, MusicInVoiceGuard)
@UseFilters(EnabledExceptionFilter, NotInVoiceExceptionFilter)
@MusicCommandDecorator()
export class MusicVolumeCommands {
	private readonly _logger = new Logger(MusicVolumeCommands.name);

	constructor(private _music: MusicService) {}

	@Subcommand({
		name: 'volume',
		description: 'Pause the current player',
	})
	public async pause(
		@Context() [interaction]: SlashCommandContext,
		@Options() { volume }: MusicVolumeOptions,
	) {
		return this._music.setVolume(interaction, volume!);
	}
}
