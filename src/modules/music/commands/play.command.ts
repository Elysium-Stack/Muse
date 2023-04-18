import { ForbiddenExceptionFilter } from '@muse/filters';
import { GuildAdminGuard } from '@muse/guards';
import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import {
	Context,
	Options,
	SlashCommandContext,
	StringOption,
	Subcommand,
} from 'necord';
import { MusicCommandDecorator } from '../music.decorator';
import { LavalinkService } from '../services/lavalink.service';
import { MusicSettingsCommands } from './settings.commands';

class MusicPlayOptions {
	@StringOption({
		name: 'song',
		description: 'A query to search or an url',
		required: true,
	})
	song: string;
}

@UseGuards(GuildAdminGuard)
@UseFilters(ForbiddenExceptionFilter)
@MusicCommandDecorator()
export class MusicPlayCommands {
	private readonly _logger = new Logger(MusicSettingsCommands.name);

	constructor(private _lavalink: LavalinkService) {}

	@Subcommand({
		name: 'play',
		description: 'Play a song or playlist',
	})
	public async play(
		@Context() [interaction]: SlashCommandContext,
		@Options() { song }: MusicPlayOptions,
	) {
		this._logger.verbose(
			`Playing song for ${interaction.user.tag}: ${song}`,
		);

		const member = await interaction.guild.members.fetch(
			interaction.user.id,
		);
		const { channel } = member.voice;
		if (!channel) {
			return interaction.reply({
				content:
					'You need to be in a voice channel to use this command!',
				ephemeral: true,
			});
		}

		const player = await this._lavalink.createPlayer({
			guildId: interaction.guild.id,
			textId: interaction.channel.id,
			voiceId: channel.id,
			volume: 50,
			deaf: true,
		});

		const result = await this._lavalink.search(song, {
			requester: interaction.user,
		});
		if (!result.tracks.length) {
			return interaction.reply('No results found!');
		}

		if (result.type === 'PLAYLIST') {
			for (const track of result.tracks) {
				player.queue.add(track);
			}
		} else {
			player.queue.add(result.tracks[0]);
		}

		if (!player.playing && !player.paused) {
			player.play();
		}

		return interaction.reply({
			content:
				result.type === 'PLAYLIST'
					? `Queued ${result.tracks.length} from ${result.playlistName}`
					: `Queued ${result.tracks[0].title}`,
			ephemeral: true,
		});
	}
}
