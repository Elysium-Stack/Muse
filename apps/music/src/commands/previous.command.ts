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
export class MusicPreviousCommands {
	private readonly _logger = new Logger(MusicPreviousCommands.name);

	constructor(private _player: MusicPlayerService) {}

	@Button('MUSIC_PREVIOUS')
	public async onButton(
		@Context()
		[interaction]: ButtonContext
	) {
		await this._player.previous(interaction.guildId);
		return interaction.deferUpdate();
	}
}
