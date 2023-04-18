import { ForbiddenExceptionFilter } from '@muse/filters';
import { GuildAdminGuard } from '@muse/guards';
import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import { Context, SlashCommandContext, Subcommand } from 'necord';
import { MusicCommandDecorator } from '../music.decorator';
import { LavalinkService } from '../services/lavalink.service';
import { MusicSettingsCommands } from './settings.commands';

@UseGuards(GuildAdminGuard)
@UseFilters(ForbiddenExceptionFilter)
@MusicCommandDecorator()
export class MusicStopCommands {
	private readonly _logger = new Logger(MusicSettingsCommands.name);

	constructor(private _lavalink: LavalinkService) {}

	@Subcommand({
		name: 'stop',
		description: 'Stop the current player',
	})
	public async stop(@Context() [interaction]: SlashCommandContext) {
		this._logger.verbose(`Stopping song for ${interaction.user.tag}`);

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

		const player = await this._lavalink.players.get(interaction.guildId);
		if (!player) {
			return interaction.reply({
				content: 'I am not currently playing anything here!',
				ephemeral: true,
			});
		}

		player.disconnect();
		return interaction.reply({
			content: 'Disconnected!',
			ephemeral: true,
		});
	}
}
