import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import { ForbiddenExceptionFilter } from '@util';
import { AdminGuard } from 'libs/util/src/lib/guards/admin.guard';
import { Context, SlashCommandContext, Subcommand } from 'necord';
import { AdminCommandDecorator } from '..';
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
