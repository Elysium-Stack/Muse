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
import { MusicHasPlayerGuard } from '../guards/has-player.guard';
import { MusicInVoiceGuard } from '../guards/in-voice.guard';
import { MusicCommandDecorator } from '../music.decorator';
import { MusicPlayerService } from '../services/player.service';

@UseGuards(MusicInVoiceGuard, MusicHasPlayerGuard)
@UseFilters(NotInVoiceExceptionFilter, HasNoPlayerExceptionFilter)
@MusicCommandDecorator()
export class MusicStopCommands {
	private readonly _logger = new Logger(MusicStopCommands.name);

	constructor(private _player: MusicPlayerService) {}

	@Subcommand({
		name: 'stop',
		description: 'Stop the current player',
	})
	public async stop(@Context() [interaction]: SlashCommandContext) {
		return this._player.stop(interaction);
	}

	@Button('MUSIC_STOP')
	public onButton(
		@Context()
		[interaction]: ButtonContext,
	) {
		return this._player.stop(interaction);
	}
}
