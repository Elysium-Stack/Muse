import {
	HasNoPlayerExceptionFilter,
	MusicCommandDecorator,
	MusicHasPlayerGuard,
	MusicInVoiceGuard,
	NotInVoiceExceptionFilter,
	getVoiceChannelFromInteraction,
} from '@music';
import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import { Button, ButtonContext, Context } from 'necord';
import { MusicService } from '../services';

@UseGuards(MusicInVoiceGuard, MusicHasPlayerGuard)
@UseFilters(NotInVoiceExceptionFilter, HasNoPlayerExceptionFilter)
@MusicCommandDecorator()
export class MusicPauseCommands {
	private readonly _logger = new Logger(MusicPauseCommands.name);

	constructor(private _music: MusicService) {}

	@Button('MUSIC_PAUSE')
	public async onButton(
		@Context()
		[interaction]: ButtonContext,
	) {
		const channel = await getVoiceChannelFromInteraction(interaction);
		if (!channel) {
			return interaction.deferUpdate();
		}

		await this._music.pause(null, interaction.guildId, channel.id);
		return interaction.deferUpdate();
	}
}
