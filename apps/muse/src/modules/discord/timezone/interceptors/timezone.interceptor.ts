import { Injectable } from '@nestjs/common';
import { AutocompleteInteraction } from 'discord.js';
import { AutocompleteInterceptor } from 'necord';

import { TIMEZONE_DATA } from '../util/constants';

@Injectable()
export class TimezoneAutocompleteInterceptor extends AutocompleteInterceptor {
	public transformOptions(interaction: AutocompleteInteraction) {
		const focused = interaction.options.getFocused(true);

		if (focused.name !== 'timezone') {
			return;
		}

		return interaction.respond(
			TIMEZONE_DATA.filter(
				(choice) =>
					choice
						.toLowerCase()
						.includes(focused.value.toString().toLowerCase()),
			)
				.splice(0, 25)
				.map((tz) => ({ name: tz, value: tz })),
		);
	}
}
