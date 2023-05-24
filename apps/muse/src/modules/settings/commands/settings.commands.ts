import { MESSAGE_PREFIX, MODULES } from '@muse/constants';
import { ForbiddenExceptionFilter } from '@muse/filters';
import { GuildAdminGuard } from '@muse/guards';
import { chunks } from '@muse/util/arrays';
import { Injectable, UseFilters, UseGuards } from '@nestjs/common';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import {
	Button,
	ButtonContext,
	Context,
	SlashCommand,
	SlashCommandContext,
} from 'necord';

@UseGuards(GuildAdminGuard)
@UseFilters(ForbiddenExceptionFilter)
@Injectable()
export class SettingsCommands {
	@SlashCommand({
		name: 'settings',
		description: 'List available modules to change settings of.',
	})
	public async onSettings(@Context() [interaction]: SlashCommandContext) {
		const data = this._getInteractionReply();
		return interaction.reply({
			...data,
			ephemeral: true,
		});
	}

	@Button('SETTINGS_SHOW')
	public async onDailyEnabledButton(@Context() [interaction]: ButtonContext) {
		const data = this._getInteractionReply();
		return interaction.update(data);
	}

	private _getInteractionReply() {
		const modulesSets = [...chunks(MODULES, 3)];
		return {
			content: `${MESSAGE_PREFIX} What module settings would you like to view?`,
			embeds: [],
			components: modulesSets.map((set) =>
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					set.map((module) =>
						new ButtonBuilder()
							.setCustomId(
								`${module
									.toUpperCase()
									.replace(/ /g, '_')}_SETTINGS_SHOW`,
							)
							.setLabel(module)
							.setStyle(ButtonStyle.Primary),
					),
				),
			),
		};
	}
}
