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
