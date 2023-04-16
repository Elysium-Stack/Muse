import { MESSAGE_PREFIX, MODULES } from '@hermes/constants';
import { chunks } from '@hermes/util/arrays';
import { Injectable } from '@nestjs/common';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import {
	Button,
	ButtonContext,
	ComponentParam,
	Context,
	SlashCommand,
	SlashCommandContext,
} from 'necord';

@Injectable()
export class SettingsCommands {
	@SlashCommand({
		name: 'settings',
		description: 'List available modules to change settings of.',
	})
	public async onSettings(@Context() [interaction]: SlashCommandContext) {
		const modulesSets = [...chunks(MODULES, 3)];
		return interaction.reply({
			content: `${MESSAGE_PREFIX} What module settings would you like to view?`,
			ephemeral: true,
			components: modulesSets.map((set) =>
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					set.map((module) =>
						new ButtonBuilder()
							.setCustomId(
								`SETTINGS_VIEW/${module.name.toLowerCase()}`,
							)
							.setLabel(module.name)
							.setStyle(ButtonStyle.Primary),
					),
				),
			),
		});
	}

	@Button('SETTINGS_VIEW/:module')
	public async onDailyEnabledButton(
		@Context() [interaction]: ButtonContext,
		@ComponentParam('module') value: string,
	) {
		// let promptFunction: promptFunction = null;

		// switch (value) {
		// 	case 'bookworm':
		// 		promptFunction = this._bookwormSettings.promptSettings;
		// 		break;
		// }

		const module = MODULES.find((m) => m.name.toLowerCase() === value);

		if (!module?.settingsPrompt) {
			return;
		}

		return module.settingsPrompt(interaction, false);
	}
}
