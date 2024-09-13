import { DiscordComponentsArrayDTO } from '@muse/types/discord-components-array.type';
import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import {
	ForbiddenExceptionFilter,
	MESSAGE_PREFIX,
	camelCaseToSnakeCase,
} from '@util';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelSelectMenuBuilder,
	ChannelType,
	CommandInteraction,
	MessageComponentInteraction,
} from 'discord.js';
import { GuildAdminGuard } from 'libs/util/src/lib/guards';
import {
	Button,
	ButtonContext,
	ChannelSelect,
	ComponentParam,
	Context,
	ISelectedChannels,
	Options,
	SelectedChannels,
	SelectedStrings,
	SlashCommandContext,
	StringOption,
	StringSelect,
	StringSelectContext,
	Subcommand,
} from 'necord';

import { RequestRoleCommandDecorator } from '../request-role.decorator';
import { RequestRoleSettingsService } from '../services/settings.service';
import { RequestRoleSettingsInterface } from '../types/settings.interface';
import { REQUEST_ROLE_SETTINGS_CHOICES } from '../util/constants';

class RequestRoleSettingsChangeOptions {
	@StringOption({
		name: 'option',
		description: 'The option to change',
		required: false,
		choices: REQUEST_ROLE_SETTINGS_CHOICES,
	})
	option: keyof RequestRoleSettingsInterface | undefined;
}

@UseGuards(GuildAdminGuard)
@UseFilters(ForbiddenExceptionFilter)
@RequestRoleCommandDecorator({
	name: 'settings',
	description: 'Request role settings commands',
})
export class RequestRoleSettingsCommands {
	private readonly _logger = new Logger(RequestRoleSettingsCommands.name);

	constructor(private _settings: RequestRoleSettingsService) {}

	@Subcommand({
		name: 'show',
		description: 'Show request role settings',
	})
	public async show(@Context() [interaction]: SlashCommandContext) {
		this._logger.verbose(
			`Loaded request role settings for ${interaction.guildId}`
		);

		return this._settings.showSettings(interaction);
	}

	@Button('REQUEST_ROLE_SETTINGS_SHOW')
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
		@Options() { option }: RequestRoleSettingsChangeOptions
	) {
		this._logger.verbose(`Change request role settings, option: ${option}`);

		if (!option) {
			return this._settings.promptSettings(interaction);
		}

		return this._askSettingValue(interaction, option);
	}

	@StringSelect('REQUEST_ROLE_SETTINGS_CHANGE_SELECT')
	public onStringSelect(
		@Context() [interaction]: StringSelectContext,
		@SelectedStrings() selected: (keyof RequestRoleSettingsInterface)[]
	) {
		return this._askSettingValue(interaction, selected[0]);
	}

	@Button('REQUEST_ROLE_SETTINGS_CHANGE_ENABLED/:value')
	public async onEnabledButton(
		@Context() [interaction]: ButtonContext,
		@ComponentParam('value') value: string
	) {
		const parsedValue = value === 'true' ? true : false;

		await this._settings.set(interaction.guildId!, 'enabled', parsedValue);

		return interaction.update({
			content: `${MESSAGE_PREFIX} Request role has been ${
				parsedValue ? 'enabled' : 'disabled'
			}`,
			components: [this._getBackButtonRow()],
		});
	}

	@Button('REQUEST_ROLE_SETTINGS_PROMPT')
	public onPromptButton(
		@Context()
		[interaction]: ButtonContext
	) {
		return this._settings.promptSettings(interaction);
	}

	@Button('REQUEST_ROLE_SETTINGS_BACK')
	public onBackButton(
		@Context()
		[interaction]: ButtonContext
	) {
		return this._settings.promptSettings(interaction);
	}

	@ChannelSelect('REQUEST_ROLE_SETTINGS_CHANGE_LOG_CHANNEL_ID')
	public async onDeleteChannelChange(
		@Context() [interaction]: ButtonContext,
		@SelectedChannels() data: ISelectedChannels
	) {
		const id = [...data.keys()][0];
		await this._settings.set(interaction.guildId!, 'logChannelId', id);

		return interaction.update({
			content: `${MESSAGE_PREFIX} Request role log channel has been changed to:${
				id.length > 0 ? `\n<#${id}>` : ' None'
			}`,
			components: [this._getBackButtonRow()],
		});
	}

	private async _askSettingValue(
		interaction: MessageComponentInteraction | CommandInteraction,
		option: keyof RequestRoleSettingsInterface
	) {
		let components: DiscordComponentsArrayDTO = [];
		const settings = await this._settings.get(interaction.guildId!);

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
								`MOD_LOG_SETTINGS_CHANGE_${camelCaseToSnakeCase(
									option
								).toUpperCase()}/true`
							)
							.setLabel('Enable')
							.setStyle(ButtonStyle.Primary)
							.setDisabled(settings?.[option] === true),
						new ButtonBuilder()
							.setCustomId(
								`MOD_LOG_SETTINGS_CHANGE_${camelCaseToSnakeCase(
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
			case 'logChannelId': {
				readableOption = 'Message delete log channel';
				currentValue = settings?.[option]?.length
					? `<#${settings?.[option]}>`
					: 'none';
				components = [
					new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
						new ChannelSelectMenuBuilder()
							.setCustomId(
								`REQUEST_ROLE_SETTINGS_CHANGE_${camelCaseToSnakeCase(
									option
								).toUpperCase()}`
							)
							.addChannelTypes(ChannelType.GuildText)
							.setPlaceholder('Select the channel to log to')
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
				.setCustomId(`REQUEST_ROLE_SETTINGS_BACK`)
				.setLabel(isCancel ? 'Cancel' : 'Back to request role settings')
				.setStyle(isCancel ? ButtonStyle.Danger : ButtonStyle.Primary)
		);
	}
}
