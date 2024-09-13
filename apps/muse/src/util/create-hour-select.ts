import {
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from 'discord.js';

import { HOUR_OPTIONS } from './constants';

export const createHoursSelect = (
	customId: string,
	placeholder = 'Select the hour you want to use',
) =>
	new StringSelectMenuBuilder()
		.setCustomId(customId)
		.setPlaceholder(placeholder)
		.setOptions(
			HOUR_OPTIONS.map(({ name, value }) =>
				new StringSelectMenuOptionBuilder()
					.setLabel(name)
					// .setDescription(description)
					.setValue(value.toString()),
			),
		);
