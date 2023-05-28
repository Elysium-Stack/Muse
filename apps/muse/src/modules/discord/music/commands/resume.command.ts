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
export class MusicResumeCommands {
	private readonly _logger = new Logger(MusicResumeCommands.name);

	constructor(private _player: MusicPlayerService) {}

	@Subcommand({
		name: 'resume',
		description: 'Resume the current player',
	})
	public async resume(@Context() [interaction]: SlashCommandContext) {
		return this._player.resume(interaction);
	}

	@Button('MUSIC_RESUME')
	public onButton(
		@Context()
		[interaction]: ButtonContext,
	) {
		return this._player.resume(interaction, false);
	}
}
