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
export class MusicShuffleCommands {
	private readonly _logger = new Logger(MusicShuffleCommands.name);

	constructor(private _player: MusicPlayerService) {}

	@Button('MUSIC_SHUFFLE')
	public async onButton(
		@Context()
		[interaction]: ButtonContext
	) {
		await this._player.shuffle(interaction.guildId);
		return interaction.deferUpdate();
	}
}
