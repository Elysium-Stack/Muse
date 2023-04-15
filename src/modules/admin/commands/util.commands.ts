import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import { Context, SlashCommandContext, Subcommand } from 'necord';
import { ForbiddenExceptionFilter } from 'src/filters';
import { AdminCommandDecorator } from '..';
import { AdminGuard } from '../guards/admin.guard';

@UseGuards(AdminGuard)
@UseFilters(ForbiddenExceptionFilter)
@AdminCommandDecorator({
	name: 'util',
	description: 'Admin utility commands',
})
export class AdminUtilsCommands {
	private readonly _logger = new Logger(AdminUtilsCommands.name);

	@Subcommand({
		name: 'ping',
		description: 'Ping-pong command',
	})
	public async ping(@Context() [interaction]: SlashCommandContext) {
		this._logger.log(`Pong used by ${interaction.user.username}!`);
		return interaction.reply({ content: 'Pong!' });
	}
}
