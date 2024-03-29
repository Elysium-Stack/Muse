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
export class MusicResumeCommands {
	private readonly _logger = new Logger(MusicResumeCommands.name);

	constructor(private _music: MusicService) {}

	@Subcommand({
		name: 'resume',
		description: 'Resume the current player',
	})
	public async resume(@Context() [interaction]: SlashCommandContext) {
		return this._music.resume(interaction);
	}
}
