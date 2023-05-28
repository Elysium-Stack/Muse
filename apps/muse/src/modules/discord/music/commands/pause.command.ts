import {
	HasNoPlayerExceptionFilter,
	MusicHasPlayerGuard,
	MusicInVoiceGuard,
	MusicPlayerService,
	NotInVoiceExceptionFilter,
} from '@music';
import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import { EnabledExceptionFilter } from '@util';
import {
	Button,
	ButtonContext,
	Context,
	SlashCommandContext,
	Subcommand,
} from 'necord';
import { MusicEnabledGuard } from '../guards/enabled.guard';
import { MusicCommandDecorator } from '../music.decorator';
@UseGuards(MusicEnabledGuard, MusicInVoiceGuard, MusicHasPlayerGuard)
@UseFilters(
	EnabledExceptionFilter,
	NotInVoiceExceptionFilter,
	HasNoPlayerExceptionFilter,
)
@MusicCommandDecorator()
export class MusicPauseCommands {
	private readonly _logger = new Logger(MusicPauseCommands.name);

	constructor(private _player: MusicPlayerService) {}

	@Subcommand({
		name: 'pause',
		description: 'Pause the current player',
	})
	public async pause(@Context() [interaction]: SlashCommandContext) {
		return this._player.pause(interaction);
	}

	@Button('MUSIC_PAUSE')
	public onButton(
		@Context()
		[interaction]: ButtonContext,
	) {
		return this._player.pause(interaction, false);
	}
}
