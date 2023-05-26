import { EnabledExceptionFilter } from '@muse/filters';
import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import {
	Button,
	ButtonContext,
	ComponentParam,
	Context,
	Options,
	SlashCommandContext,
	StringOption,
	Subcommand,
} from 'necord';
import { NotInVoiceExceptionFilter } from '../filters/in-voice.filter';
import { MusicEnabledGuard } from '../guards/enabled.guard';
import { MusicInVoiceGuard } from '../guards/in-voice.guard';
import { MusicCommandDecorator } from '../music.decorator';
import { MusicPlayerService } from '../services/player.service';
import { MusicSettingsCommands } from './settings.commands';

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
	private readonly _logger = new Logger(MusicSettingsCommands.name);

	constructor(private _player: MusicPlayerService) {}

	@Subcommand({
		name: 'play',
		description: 'Play a song or playlist',
	})
	public async play(
		@Context() [interaction]: SlashCommandContext,
		@Options() { song }: MusicPlayOptions,
	) {
		return this._player.play(interaction, song!);
	}

	@Button('MUSIC_PLAY/:song')
	public onButton(
		@Context()
		[interaction]: ButtonContext,
		@ComponentParam('song') song: string,
	) {
		return this._player.play(interaction, song);
	}
}
