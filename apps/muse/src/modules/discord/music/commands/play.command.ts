import {
	MusicCommandDecorator,
	MusicInVoiceGuard,
	NotInVoiceExceptionFilter,
} from '@music';
import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import { EnabledExceptionFilter } from '@util';
import {
	Context,
	Options,
	SlashCommandContext,
	StringOption,
	Subcommand,
} from 'necord';
import { MusicEnabledGuard } from '../guards/enabled.guard';
import { MusicService } from '../services';

class MusicPlayOptions {
	@StringOption({
		name: 'song',
		description: 'A query to search or an url',
		required: true,
	})
	song: string | undefined;
}

@UseGuards(MusicEnabledGuard, MusicInVoiceGuard)
@UseFilters(EnabledExceptionFilter, NotInVoiceExceptionFilter)
@MusicCommandDecorator()
export class MusicPlayCommands {
	private readonly _logger = new Logger(MusicPlayCommands.name);

	constructor(private _music: MusicService) {}

	@Subcommand({
		name: 'play',
		description: 'Play a song or playlist',
	})
	public async play(
		@Context() [interaction]: SlashCommandContext,
		@Options() { song }: MusicPlayOptions,
	) {
		return this._music.play(interaction, song!);
	}
}
