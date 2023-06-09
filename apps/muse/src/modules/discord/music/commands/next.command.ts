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
export class MusicNextCommands {
	private readonly _logger = new Logger(MusicNextCommands.name);

	constructor(private _player: MusicPlayerService) {}

	@Subcommand({
		name: 'next',
		description: 'Play the next song in the queue',
	})
	public async next(@Context() [interaction]: SlashCommandContext) {
		return this._player.next(interaction);
	}

	@Button('MUSIC_NEXT')
	public onButton(
		@Context()
		[interaction]: ButtonContext,
	) {
		return this._player.next(interaction, false);
	}
}
