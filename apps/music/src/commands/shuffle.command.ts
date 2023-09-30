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
export class MusicShuffleCommands {
	private readonly _logger = new Logger(MusicShuffleCommands.name);

	constructor(private _music: MusicService) {}

	@Button('MUSIC_SHUFFLE')
	public async onButton(
		@Context()
		[interaction]: ButtonContext,
	) {
		const channel = await getVoiceChannelFromInteraction(interaction);
		if (!channel) {
			return interaction.deferUpdate();
		}

		await this._music.shuffle(null, interaction.guildId, channel.id);
		return interaction.deferUpdate();
	}
}
