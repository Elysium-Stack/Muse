import { EnabledExceptionFilter } from '@muse/filters';
import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import {
	Button,
	ButtonContext,
	Context,
	SlashCommandContext,
	Subcommand,
} from 'necord';
import { HasNoPlayerExceptionFilter } from '../filters/has-player.filter';
import { NotInVoiceExceptionFilter } from '../filters/in-voice.filter';
import { MusicEnabledGuard } from '../guards/enabled.guard';
import { MusicHasPlayerGuard } from '../guards/has-player.guard';
import { MusicInVoiceGuard } from '../guards/in-voice.guard';
import { MusicCommandDecorator } from '../music.decorator';
import { MusicPlayerService } from '../services/player.service';

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