import { EnabledExceptionFilter } from '@muse/filters';
import {
	MusicInVoiceGuard,
	MusicPlayerService,
	NotInVoiceExceptionFilter,
} from '@muse/music';
import { PrismaService } from '@muse/prisma';
import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import {
	Button,
	ButtonContext,
	ComponentParam,
	Context,
	Options,
	SlashCommandContext,
	StringOption,
	Subcommand,
} from 'necord';
import { MusicEnabledGuard } from '../guards/enabled.guard';
import { MusicCommandDecorator } from '../music.decorator';
import { MusicSettingsCommands } from './settings.commands';

class MusicPlayOptions {
	@StringOption({
		name: 'song',
		description: 'A query to search or an url',
		required: true,
	})
	song: string | undefined;
}

@UseGuards(MusicEnabledGuard, MusicInVoiceGuard)
@UseFilters(EnabledExceptionFilter, NotInVoiceExceptionFilter)
@MusicCommandDecorator()
export class MusicPlayCommands {
	private readonly _logger = new Logger(MusicSettingsCommands.name);

	constructor(
		private _player: MusicPlayerService,
		private _prisma: PrismaService,
	) {}

	@Subcommand({
		name: 'play',
		description: 'Play a song or playlist',
	})
	public async play(
		@Context() [interaction]: SlashCommandContext,
		@Options() { song }: MusicPlayOptions,
	) {
		return this._play(interaction, song);
	}

	@Button('MUSIC_PLAY/:song')
	public onButton(
		@Context()
		[interaction]: ButtonContext,
		@ComponentParam('song') song: string,
	) {
		return this._play(interaction, song);
	}

	private async _play(interaction, song) {
		const data = await this._player.play(interaction, song!);

		if (!data) {
			return;
		}

		const { result } = data;

		if (result) {
			const tracks = [...result.tracks].map((track) => {
				delete track.kazagumo;
				return track;
			});

			await this._prisma.musicLog
				.create({
					data: {
						guildId: interaction.guildId!,
						userId: interaction.user.id,
						query: song,
						result: !tracks.length
							? undefined
							: JSON.stringify(
									result.type === 'PLAYLIST'
										? tracks
										: tracks[0],
							  ),
					},
				})
				.catch(() => null);
		}

		// return reply;
	}
}
