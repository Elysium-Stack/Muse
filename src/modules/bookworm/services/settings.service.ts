import { BaseSettingsService } from '@muse/base';
import { SettingsService } from '@muse/modules/settings';
import { MESSAGE_PREFIX } from '@muse/util/constants';
import { Injectable } from '@nestjs/common';
import {
	ActionRowBuilder,
	CommandInteraction,
	MessageComponentInteraction,
	SelectMenuBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from 'discord.js';
import { BookwormSettingsInterface } from '../types/settings.interface';
import { BOOKWORM_SETTINGS_CHOICES } from '../util/constants';

@Injectable()
export class BookwormSettingsService extends BaseSettingsService<BookwormSettingsInterface> {
	protected _base = 'bookworm';

	constructor(protected _settings: SettingsService) {
		super(_settings);
	}

	public promptSettings(
		interaction: MessageComponentInteraction | CommandInteraction,
		isFollowUp = false,
		message?: string,
	) {
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

		const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents(
			select,
		);

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
	}
}
