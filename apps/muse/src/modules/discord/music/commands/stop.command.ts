import {
	HasNoPlayerExceptionFilter,
	MusicHasPlayerGuard,
	MusicInVoiceGuard,
	MusicPlayerService,
	NotInVoiceExceptionFilter,
} from '@music';
import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import {
	Button,
	ButtonContext,
	Context,
	SlashCommandContext,
	Subcommand,
} from 'necord';
import { MusicCommandDecorator } from '../music.decorator';

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
