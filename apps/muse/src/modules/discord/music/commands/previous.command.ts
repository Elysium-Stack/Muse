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
export class MusicPreviousCommands {
	private readonly _logger = new Logger(MusicPreviousCommands.name);

	constructor(private _player: MusicPlayerService) {}

	@Subcommand({
		name: 'previous',
		description: 'Play the previous song in the queue',
	})
	public async previous(@Context() [interaction]: SlashCommandContext) {
		return this._player.previous(interaction);
	}

	@Button('MUSIC_PREVIOUS')
	public onButton(
		@Context()
		[interaction]: ButtonContext,
	) {
		return this._player.previous(interaction, false);
	}
}
