import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import { Button, ButtonContext, Context } from 'necord';

import {
	HasNoPlayerExceptionFilter,
	MusicCommandDecorator,
	MusicHasPlayerGuard,
	MusicInVoiceGuard,
	MusicPlayerService,
	NotInVoiceExceptionFilter,
} from '@music';

@UseGuards(MusicInVoiceGuard, MusicHasPlayerGuard)
@UseFilters(NotInVoiceExceptionFilter, HasNoPlayerExceptionFilter)
@MusicCommandDecorator()
export class MusicPauseCommands {
	private readonly _logger = new Logger(MusicPauseCommands.name);

	constructor(private _player: MusicPlayerService) {}

	@Button('MUSIC_PAUSE')
	public async onButton(
		@Context()
		[interaction]: ButtonContext
	) {
		await this._player.pause(interaction.guildId);
		return interaction.deferUpdate();
	}
}
