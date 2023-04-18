import { MESSAGE_PREFIX } from '@muse/util/constants';
import { promptFunction } from '@muse/util/types';
import {
	ActionRowBuilder,
	CommandInteraction,
	MessageComponentInteraction,
	SelectMenuBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from 'discord.js';
import { BOOKWORM_SETTINGS_CHOICES } from './constants';

export const bookwormPromptSetting: promptFunction = (
	interaction: MessageComponentInteraction | CommandInteraction,
	isFollowUp = false,
	message?: string,
) => {
	const select = new StringSelectMenuBuilder()
		.setCustomId('BOOKWORM_SETTINGS_CHANGE_SELECT')
		.setPlaceholder('Select the option to change')
		.setOptions(
			BOOKWORM_SETTINGS_CHOICES.map(({ name, description, value }) =>
				new StringSelectMenuOptionBuilder()
					.setLabel(name)
					.setDescription(description)
					.setValue(value),
			),
		);

	const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents(select);

	const data = {
		content: `${MESSAGE_PREFIX}${
			isFollowUp ? ` ${message}\n\n` : ' '
		}What option would you like to change?`,
		components: [row],
	};

	if (interaction instanceof MessageComponentInteraction) {
		return interaction.update(data);
	}

	return interaction.reply({
		...data,
		ephemeral: true,
	});
};
