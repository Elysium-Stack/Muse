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
export class MusicLoopCommands {
	private readonly _logger = new Logger(MusicLoopCommands.name);

	constructor(private _player: MusicPlayerService) {}

	@Subcommand({
		name: 'loop',
		description: 'Loop the current queue',
	})
	public async next(@Context() [interaction]: SlashCommandContext) {
		return this._player.loop(interaction);
	}

	@Button('MUSIC_LOOP')
	public onButton(
		@Context()
		[interaction]: ButtonContext,
	) {
		return this._player.loop(interaction, false);
	}
}
