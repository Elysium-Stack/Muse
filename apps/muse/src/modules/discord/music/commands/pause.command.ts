import {
	MusicCommandDecorator,
	MusicInVoiceGuard,
	NotInVoiceExceptionFilter,
} from '@music';
import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import { EnabledExceptionFilter } from '@util';
import { Context, SlashCommandContext, Subcommand } from 'necord';
import { MusicEnabledGuard } from '../guards/enabled.guard';
import { MusicService } from '../services';

@UseGuards(MusicEnabledGuard, MusicInVoiceGuard)
@UseFilters(EnabledExceptionFilter, NotInVoiceExceptionFilter)
@MusicCommandDecorator()
export class MusicPauseCommands {
	private readonly _logger = new Logger(MusicPauseCommands.name);

	constructor(private _music: MusicService) {}

	@Subcommand({
		name: 'pause',
		description: 'Pause the current player',
	})
	public async pause(@Context() [interaction]: SlashCommandContext) {
		return this._music.pause(interaction);
	}
}
