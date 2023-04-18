import { HOUR_OPTIONS, MESSAGE_PREFIX } from '@muse/constants';
import { ForbiddenExceptionFilter } from '@muse/filters';
import { GuildAdminGuard } from '@muse/guards/guild-admin.guard';
import { createHoursSelect } from '@muse/util/create-hour-select';
import { camelCaseToSnakeCase } from '@muse/util/strings';
import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelSelectMenuBuilder,
	ChannelType,
	CommandInteraction,
	MessageComponentInteraction,
	RoleSelectMenuBuilder,
	StringSelectMenuBuilder,
} from 'discord.js';
import {
	Button,
	ButtonContext,
	ChannelSelect,
	ComponentParam,
	Context,
	ISelectedChannels,
	ISelectedRoles,
	Options,
	RoleSelect,
	SelectedChannels,
	SelectedRoles,
	SelectedStrings,
	SlashCommandContext,
	StringOption,
	StringSelect,
	StringSelectContext,
	Subcommand,
} from 'necord';
import { BookwormCommandDecorator } from '../bookworm.decorator';
import { BookwormSettingsService } from '../services/settings.service';
import { BOOKWORM_SETTINGS_CHOICES } from '../util/constants';

class BookwormSettingsChangeOptions {
	@StringOption({
		name: 'option',
		description: 'The option to change',
		required: false,
		choices: BOOKWORM_SETTINGS_CHOICES,
	})
	option: string;
}

@UseGuards(GuildAdminGuard)
@UseFilters(ForbiddenExceptionFilter)
@BookwormCommandDecorator({
	name: 'settings',
	description: 'Bookworm settings commands',
})
export class BookwormSettingsCommands {
	private readonly _logger = new Logger(BookwormSettingsCommands.name);

	constructor(private _settings: BookwormSettingsService) {}

	@Subcommand({
		name: 'show',
		description: 'Show bookworm settings',
	})
	public async show(@Context() [interaction]: SlashCommandContext) {
		this._logger.verbose(
			`Loaded bookworm settings for ${interaction.guildId}`,
		);
		const settings = await this._settings.get(interaction.guildId);

		console.log(settings);
		return interaction.reply({ content: 'Settings for the bookworm' });
	}

	// settings change flow
	@Subcommand({
		name: 'change',
		description: 'Change settings',
	})
	public async changeSettings(
		@Context() [interaction]: SlashCommandContext,
		@Options() { option }: BookwormSettingsChangeOptions,
	) {
		this._logger.verbose(`Change bookworm settings, option: ${option}`);

		if (!option) {
			return this._settings.promptSettings(interaction);
		}

		return this._askSettingValue(interaction, option);
	}

	@Button('BOOKWORM_SETTINGS_BACK')
	public onBackButton(
		@Context()
		[interaction]: ButtonContext,
	) {
		return this._settings.promptSettings(interaction);
	}

	@StringSelect('BOOKWORM_SETTINGS_CHANGE_SELECT')
	public onStringSelect(
		@Context() [interaction]: StringSelectContext,
		@SelectedStrings() selected: string[],
	) {
		return this._askSettingValue(interaction, selected[0]);
	}

	@Button('BOOKWORM_SETTINGS_CHANGE_ENABLED/:value')
	public async onEnabledButton(
		@Context() [interaction]: ButtonContext,
		@ComponentParam('value') value: string,
	) {
		const parsedValue = value === 'true' ? true : false;

		await this._settings.set(interaction.guildId, 'enabled', parsedValue);

		return interaction.update({
			content: `${MESSAGE_PREFIX} Bookworm has been ${
				parsedValue ? 'enabled' : 'disabled'
			}`,
			components: [this._getBackButtonRow()],
		});
	}

	@Button('BOOKWORM_SETTINGS_CHANGE_DAILY_ENABLED/:value')
	public async onDailyEnabledButton(
		@Context() [interaction]: ButtonContext,
		@ComponentParam('value') value: string,
	) {
		const parsedValue = value === 'true' ? true : false;

		await this._settings.set(
			interaction.guildId,
			'dailyEnabled',
			parsedValue,
		);

		return interaction.update({
			content: `${MESSAGE_PREFIX} Bookworm daily questions has been ${
				parsedValue ? 'enabled' : 'disabled'
			}`,
			components: [this._getBackButtonRow()],
		});
	}

	@ChannelSelect('BOOKWORM_SETTINGS_CHANGE_CHANNEL_ID')
	public async onChannelChange(
		@Context() [interaction]: ButtonContext,
		@SelectedChannels() [[id]]: ISelectedChannels,
	) {
		await this._settings.set(interaction.guildId, 'channelId', id);

		return interaction.update({
			content: `${MESSAGE_PREFIX} Bookworm channel has been changed to <#${id}>`,
			components: [this._getBackButtonRow()],
		});
	}

	@ChannelSelect('BOOKWORM_SETTINGS_CHANGE_DAILY_CHANNEL_ID')
	public async onDailyChannelChange(
		@Context() [interaction]: ButtonContext,
		@SelectedChannels() [[id]]: ISelectedChannels,
	) {
		await this._settings.set(interaction.guildId, 'dailyChannelId', id);

		return interaction.update({
			content: `${MESSAGE_PREFIX} Bookworm daily channel has been changed to <#${id}>`,
			components: [this._getBackButtonRow()],
		});
	}

	@RoleSelect('BOOKWORM_SETTINGS_CHANGE_PING_ROLE_ID')
	public async onPingRoldChange(
		@Context() [interaction]: ButtonContext,
		@SelectedRoles() [[id]]: ISelectedRoles,
	) {
		await this._settings.set(interaction.guildId, 'pingRoleId', id);

		return interaction.update({
			content: `${MESSAGE_PREFIX} Bookworm ping role has been changed to <@&${id}>`,
			components: [this._getBackButtonRow()],
		});
	}

	@StringSelect('BOOKWORM_SETTINGS_CHANGE_DAILY_HOUR')
	public async onDailyHourChange(
		@Context() [interaction]: StringSelectContext,
		@SelectedStrings() [selected]: string[],
	) {
		const parsed = parseInt(selected, 10);

		if (isNaN(parsed)) {
			return interaction.update({
				content: `${MESSAGE_PREFIX} Something wen't wrong, try again later.`,
				components: [this._getBackButtonRow()],
			});
		}

		await this._settings.set(interaction.guildId, 'dailyHour', parsed);

		const time = !isNaN(parsed)
			? HOUR_OPTIONS.find((h) => h.value === parsed).name
			: 'none';

		return interaction.update({
			content: `${MESSAGE_PREFIX} Bookworm daily hour has been changed to \`${time}\``,
			components: [this._getBackButtonRow()],
		});
	}

	private async _askSettingValue(
		interaction: MessageComponentInteraction | CommandInteraction,
		option: string,
	) {
		let components = [];
		const settings = await this._settings.get(interaction.guildId);

		let currentValue = settings[option];
		let readableOption = option;

		switch (option) {
			case 'enabled':
			case 'dailyEnabled':
				readableOption =
					option === 'enabled' ? 'Enabled' : 'Daily enabled';
				currentValue = settings[option] ? 'Enabled' : 'Disabled';
				components = [
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder()
							.setCustomId(
								`BOOKWORM_SETTINGS_CHANGE_${camelCaseToSnakeCase(
									option,
								).toUpperCase()}/true`,
							)
							.setLabel('Enabled')
							.setStyle(ButtonStyle.Primary)
							.setDisabled(settings[option] === true),
						new ButtonBuilder()
							.setCustomId(
								`BOOKWORM_SETTINGS_CHANGE_${camelCaseToSnakeCase(
									option,
								).toUpperCase()}/false`,
							)
							.setLabel('Disabled')
							.setStyle(ButtonStyle.Danger)
							.setDisabled(settings[option] === false),
					),
				];
				break;
			case 'channelId':
			case 'dailyChannelId':
				readableOption =
					option === 'channelId' ? 'Channel' : 'Daily channel';
				currentValue = settings[option]
					? `<#${settings[option]}>`
					: 'none';
				components = [
					new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
						new ChannelSelectMenuBuilder()
							.setCustomId(
								`BOOKWORM_SETTINGS_CHANGE_${camelCaseToSnakeCase(
									option,
								).toUpperCase()}`,
							)
							.addChannelTypes(ChannelType.GuildText)
							.setPlaceholder('Select a channel'),
					),
				];
				break;
			case 'pingRoleId':
				readableOption = 'Ping role';
				currentValue = settings[option]
					? `<@&${settings[option]}>`
					: 'none';
				components = [
					new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
						new RoleSelectMenuBuilder()
							.setCustomId(
								`BOOKWORM_SETTINGS_CHANGE_${camelCaseToSnakeCase(
									option,
								).toUpperCase()}`,
							)
							.setPlaceholder('Select a role'),
					),
				];
				break;
			case 'dailyHour':
				readableOption = 'Daily hour';
				currentValue = !isNaN(settings[option])
					? `\`${
							HOUR_OPTIONS.find(
								(h) => h.value === settings[option],
							).name
					  }\``
					: 'none';
				components = [
					new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
						createHoursSelect(
							'BOOKWORM_SETTINGS_CHANGE_DAILY_HOUR',
						),
					),
				];
				break;
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
				.setCustomId(`BOOKWORM_SETTINGS_BACK`)
				.setLabel(isCancel ? 'Cancel' : 'Back to bookworm settings')
				.setStyle(isCancel ? ButtonStyle.Danger : ButtonStyle.Primary),
		);
	}
}
