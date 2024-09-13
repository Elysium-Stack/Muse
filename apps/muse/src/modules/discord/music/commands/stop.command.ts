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
export class MusicStopCommands {
	private readonly _logger = new Logger(MusicStopCommands.name);

	constructor(private _music: MusicService) {}

	@Subcommand({
		name: 'stop',
		description: 'Stop the music',
	})
	public async stop(@Context() [interaction]: SlashCommandContext) {
		return this._music.stop(interaction);
	}
}
