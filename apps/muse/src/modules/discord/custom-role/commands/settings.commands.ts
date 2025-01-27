import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	CommandInteraction,
	MessageComponentInteraction,
	RoleSelectMenuBuilder,
} from 'discord.js';
import {
	Button,
	ButtonContext,
	ComponentParam,
	Context,
	ISelectedRoles,
	Options,
	RoleSelect,
	SelectedRoles,
	SelectedStrings,
	SlashCommandContext,
	StringOption,
	StringSelect,
	StringSelectContext,
	Subcommand,
} from 'necord';

import { CustomRoleCommandDecorator } from '../custom-role.decorator';
import { CustomRoleSettingsService } from '../services/settings.service';
import { CustomRoleSettingsInterface } from '../types/settings.interface';
import { CUSTOM_ROLE_SETTINGS_CHOICES } from '../util/constants';

import { DiscordComponentsArrayDTO } from '@muse/types/discord-components-array.type';

import {
	ForbiddenExceptionFilter,
	MESSAGE_PREFIX,
	camelCaseToSnakeCase,
} from '@util';

import { GuildAdminGuard } from 'libs/util/src/lib/guards';

class CustomRoleSettingsChangeOptions {
	@StringOption({
		name: 'option',
		description: 'The option to change',
		required: false,
		choices: CUSTOM_ROLE_SETTINGS_CHOICES,
	})
	option: keyof CustomRoleSettingsInterface | undefined;
}

@UseGuards(GuildAdminGuard)
@UseFilters(ForbiddenExceptionFilter)
@CustomRoleCommandDecorator({
	name: 'settings',
	description: 'Custom role settings commands',
})
export class CustomRoleSettingsCommands {
	private readonly _logger = new Logger(CustomRoleSettingsCommands.name);

	constructor(private _settings: CustomRoleSettingsService) {}

	@Subcommand({
		name: 'show',
		description: 'Show custom role settings',
	})
	public async show(@Context() [interaction]: SlashCommandContext) {
		this._logger.verbose(
			`Loaded custom role settings for ${interaction.guildId}`
		);

		return this._settings.showSettings(interaction);
	}

	@Button('CUSTOM_ROLE_SETTINGS_SHOW')
	public onShowButton(
		@Context()
		[interaction]: ButtonContext
	) {
		return this._settings.showSettings(interaction);
	}

	// settings change flow
	@Subcommand({
		name: 'change',
		description: 'Change settings',
	})
	public async changeSettings(
		@Context() [interaction]: SlashCommandContext,
		@Options() { option }: CustomRoleSettingsChangeOptions
	) {
		this._logger.verbose(`Change custom role settings, option: ${option}`);

		if (!option) {
			return this._settings.promptSettings(interaction);
		}

		return this._askSettingValue(interaction, option);
	}

	@Button('CUSTOM_ROLE_SETTINGS_PROMPT')
	public onPromptButton(
		@Context()
		[interaction]: ButtonContext
	) {
		return this._settings.promptSettings(interaction);
	}

	@Button('CUSTOM_ROLE_SETTINGS_BACK')
	public onBackButton(
		@Context()
		[interaction]: ButtonContext
	) {
		return this._settings.promptSettings(interaction);
	}

	@StringSelect('CUSTOM_ROLE_SETTINGS_CHANGE_SELECT')
	public onStringSelect(
		@Context() [interaction]: StringSelectContext,
		@SelectedStrings() selected: (keyof CustomRoleSettingsInterface)[]
	) {
		return this._askSettingValue(interaction, selected[0]);
	}

	@Button('CUSTOM_ROLE_SETTINGS_CHANGE_ENABLED/:value')
	public async onEnabledButton(
		@Context() [interaction]: ButtonContext,
		@ComponentParam('value') value: string
	) {
		const parsedValue = value === 'true' ? true : false;

		await this._settings.set(interaction.guildId, 'enabled', parsedValue);

		return interaction.update({
			content: `${MESSAGE_PREFIX} Custom role module has been ${
				parsedValue ? 'enabled' : 'disabled'
			}`,
			components: [this._getBackButtonRow()],
		});
	}

	@RoleSelect('CUSTOM_ROLE_SETTINGS_CHANGE_AFTER_ROLE_ID')
	public async onRoleChange(
		@Context() [interaction]: ButtonContext,
		@SelectedRoles() data: ISelectedRoles
	) {
		const id = [...data.keys()][0];
		await this._settings.set(interaction.guildId, 'afterRoleId', id);

		return interaction.update({
			content: `${MESSAGE_PREFIX} New roles will be created after the <@&${id}> role`,
			components: [this._getBackButtonRow()],
		});
	}

	private async _askSettingValue(
		interaction: MessageComponentInteraction | CommandInteraction,
		option: keyof CustomRoleSettingsInterface
	) {
		let components: DiscordComponentsArrayDTO = [];
		const settings = await this._settings.get(interaction.guildId);

		let currentValue: string | string[] | boolean | undefined =
			settings?.[option];
		let readableOption: string = option;

		switch (option) {
			case 'enabled': {
				readableOption = 'Enabled';
				currentValue = settings?.[option] ? 'Enabled' : 'Disabled';
				components = [
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder()
							.setCustomId(
								`CUSTOM_ROLE_SETTINGS_CHANGE_${camelCaseToSnakeCase(
									option
								).toUpperCase()}/true`
							)
							.setLabel('Enable')
							.setStyle(ButtonStyle.Primary)
							.setDisabled(settings?.[option] === true),
						new ButtonBuilder()
							.setCustomId(
								`CUSTOM_ROLE_SETTINGS_CHANGE_${camelCaseToSnakeCase(
									option
								).toUpperCase()}/false`
							)
							.setLabel('Disable')
							.setStyle(ButtonStyle.Danger)
							.setDisabled(settings?.[option] === false)
					),
				];
				break;
			}
			case 'afterRoleId': {
				readableOption = 'Roles placed after role';
				currentValue = settings?.[option]?.length
					? `\n<@&${settings[option]}>`
					: 'none';
				components = [
					new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
						new RoleSelectMenuBuilder()
							.setMinValues(1)
							.setMaxValues(1)
							.setCustomId(
								`CUSTOM_ROLE_SETTINGS_CHANGE_${camelCaseToSnakeCase(
									option
								).toUpperCase()}`
							)
							.setPlaceholder(
								'Select the role new roles should be placed after'
							)
					),
				];
				break;
			}
		}

		components.push(this._getBackButtonRow(true));

		if (interaction instanceof MessageComponentInteraction) {
			return interaction.update({
				content: `${MESSAGE_PREFIX} What would you like to change **${readableOption}** to?

Current value: ${currentValue}`,
				components,
			});
		}

		return interaction.reply({
			content: `${MESSAGE_PREFIX} What would you like to change **${readableOption}** to?

Current value: ${currentValue}`,
			components,
			ephemeral: true,
		});
	}

	private _getBackButtonRow(isCancel = false) {
		return new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId(`CUSTOM_ROLE_SETTINGS_BACK`)
				.setLabel(isCancel ? 'Cancel' : 'Back to custom role settings')
				.setStyle(isCancel ? ButtonStyle.Danger : ButtonStyle.Primary)
		);
	}
}
