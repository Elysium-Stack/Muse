import {
	HasNoPlayerExceptionFilter,
	MusicCommandDecorator,
	MusicHasPlayerGuard,
	MusicInVoiceGuard,
	MusicPlayerService,
	NotInVoiceExceptionFilter,
} from '@music';
import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import { Button, ButtonContext, Context } from 'necord';

@UseGuards(MusicInVoiceGuard, MusicHasPlayerGuard)
@UseFilters(NotInVoiceExceptionFilter, HasNoPlayerExceptionFilter)
@MusicCommandDecorator()
export class MusicLoopCommands {
	private readonly _logger = new Logger(MusicLoopCommands.name);

	constructor(private _player: MusicPlayerService) {}

	@Button('MUSIC_LOOP')
	public async onButton(
		@Context()
		[interaction]: ButtonContext
	) {
		await this._player.loop(interaction.guildId);
		return interaction.deferUpdate();
	}
}
