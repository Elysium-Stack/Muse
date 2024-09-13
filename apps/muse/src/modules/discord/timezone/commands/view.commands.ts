import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import { Context, SlashCommandContext, Subcommand } from 'necord';

import { TimezoneEnabledGuard } from '../guards/enabled.guard';
import { TimezoneGeneralService } from '../services/general.service';
import { TimezoneCommandDecorator } from '../timezone.decorator';

import { EnabledExceptionFilter, MESSAGE_PREFIX } from '@util';

@UseGuards(TimezoneEnabledGuard)
@UseFilters(EnabledExceptionFilter)
@TimezoneCommandDecorator()
export class TimezoneViewCommands {
	private readonly _logger = new Logger(TimezoneViewCommands.name);

	constructor(private _timezone: TimezoneGeneralService) {}

	@Subcommand({
		name: 'view',
		description: 'View your timezone',
	})
	public async view(@Context() [interaction]: SlashCommandContext) {
		const data = await this._timezone.getTimezone(
			interaction.guildId,
			interaction.user.id
		);

		if (!data) {
			return interaction.reply({
				content: `${MESSAGE_PREFIX} You have not set your timezone yet!\nUse \`/timezone set\` to set your timezone!`,
				ephemeral: true,
			});
		}

		return interaction.reply({
			content: `${MESSAGE_PREFIX} Your timezone is set to \`${data.timezone}\`!`,
			ephemeral: true,
		});
	}
}
