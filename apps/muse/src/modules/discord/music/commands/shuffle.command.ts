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
export class MusicShuffleCommands {
	private readonly _logger = new Logger(MusicShuffleCommands.name);

	constructor(private _player: MusicPlayerService) {}

	@Subcommand({
		name: 'shuffle',
		description: 'Shuffle the current queue',
	})
	public async next(@Context() [interaction]: SlashCommandContext) {
		return this._player.shuffle(interaction);
	}

	@Button('MUSIC_SHUFFLE')
	public onButton(
		@Context()
		[interaction]: ButtonContext,
	) {
		return this._player.shuffle(interaction, false);
	}
}
