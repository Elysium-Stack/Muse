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
export class MusicNextCommands {
	private readonly _logger = new Logger(MusicNextCommands.name);

	constructor(private _player: MusicPlayerService) {}

	@Button('MUSIC_NEXT')
	public async onButton(
		@Context()
		[interaction]: ButtonContext
	) {
		await this._player.next(interaction.guildId);
		return interaction.deferUpdate();
	}
}
