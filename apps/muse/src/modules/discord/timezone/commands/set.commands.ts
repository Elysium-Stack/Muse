import { Logger, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import {
	Context,
	Options,
	SlashCommandContext,
	StringOption,
	Subcommand,
} from 'necord';

import { TimezoneEnabledGuard } from '../guards/enabled.guard';
import { TimezoneAutocompleteInterceptor } from '../interceptors/timezone.interceptor';
import { TimezoneGeneralService } from '../services/general.service';
import { TimezoneCommandDecorator } from '../timezone.decorator';
import { TIMEZONE_DATA } from '../util/constants';

import { EnabledExceptionFilter, MESSAGE_PREFIX } from '@util';

class TimezoneSetOptions {
	@StringOption({
		name: 'timezone',
		description: 'The timezone to change',
		autocomplete: true,
		required: true,
	})
	timezone: string | undefined;
}

@UseGuards(TimezoneEnabledGuard)
@UseFilters(EnabledExceptionFilter)
@TimezoneCommandDecorator()
export class TimezoneSetCommands {
	private readonly _logger = new Logger(TimezoneSetCommands.name);

	constructor(private _timezone: TimezoneGeneralService) {}

	@UseInterceptors(TimezoneAutocompleteInterceptor)
	@Subcommand({
		name: 'set',
		description: 'Set your timezone',
	})
	public async set(
		@Context() [interaction]: SlashCommandContext,
		@Options() { timezone }: TimezoneSetOptions
	) {
		if (!timezone) {
			return interaction.reply({
				content: `${MESSAGE_PREFIX} Please provide a timezone!`,
				ephemeral: true,
			});
		}

		if (!TIMEZONE_DATA.includes(timezone)) {
			return interaction.reply({
				content: `${MESSAGE_PREFIX} This is not a known timezone, try again later`,
				ephemeral: true,
			});
		}

		await this._timezone.setTimezone(
			interaction.guildId,
			interaction.user.id,
			timezone
		);

		return interaction.reply({
			content: `${MESSAGE_PREFIX} Timezone saved!\nYour new timezone is set to: \`${timezone}\``,
		});
	}
}
