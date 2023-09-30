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
export class MusicResumeCommands {
	private readonly _logger = new Logger(MusicResumeCommands.name);

	constructor(private _music: MusicService) {}

	@Button('MUSIC_RESUME')
	public async onButton(
		@Context()
		[interaction]: ButtonContext,
	) {
		const channel = await getVoiceChannelFromInteraction(interaction);
		if (!channel) {
			return interaction.deferUpdate();
		}

		await this._music.resume(null, interaction.guildId, channel.id);
		return interaction.deferUpdate();
	}
}
