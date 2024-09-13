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
export class MusicNextCommands {
	private readonly _logger = new Logger(MusicNextCommands.name);

	constructor(private _music: MusicService) {}

	@Subcommand({
		name: 'next',
		description: 'Play the next song in the music queue',
	})
	public async next(@Context() [interaction]: SlashCommandContext) {
		return this._music.next(interaction);
	}
}
