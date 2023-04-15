import { MESSAGE_PREFIX } from '@hermes/constants';
import { camelCaseToSnakeCase } from '@hermes/util/strings';
import { Logger } from '@nestjs/common';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelSelectMenuBuilder,
	ChannelType,
	CommandInteraction,
	MessageComponentInteraction,
	RoleSelectMenuBuilder,
} from 'discord.js';
import {
	Button,
	ButtonContext,
	ComponentParam,
	Context,
	Options,
	SelectedStrings,
	SlashCommandContext,
	StringOption,
	StringSelect,
	StringSelectContext,
	Subcommand,
} from 'necord';
import { BookwormCommandDecorator } from '../bookworm.decorator';
import { BookwormSettingsService } from '../services/bookworm.service';
import { BOOKWORM_SETTINGS_CHOICES } from '../util/constants';
import { bookwormPromptSetting } from '../util/prompt-settings';

class BookwormSettingsChangeOptions {
	@StringOption({
		name: 'option',
		description: 'The option to change',
		required: false,
		choices: BOOKWORM_SETTINGS_CHOICES,
	})
	option: string;
}

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
		return interaction.reply({ content: 'Settings!' });
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
			return bookwormPromptSetting(interaction);
		}

		return this._askSettingValue(interaction, option);
	}

	@StringSelect('BOOKWORM_SETTINGS_CHANGE_SELECT')
	public onStringSelect(
		@Context()
		[interaction]: StringSelectContext,
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

		return bookwormPromptSetting(
			interaction,
			true,
			`Bookworm has been ${parsedValue ? 'enabled' : 'disabled'}`,
		);
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
			components: [],
		});
	}

	private async _askSettingValue(
		interaction: MessageComponentInteraction | CommandInteraction,
		option: string,
	) {
		let components = [];
		const settings = await this._settings.get(interaction.guildId);

		// TODO: Add saving for channels & role
		switch (option) {
			case 'enabled':
			case 'dailyEnabled':
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
			case 'bookwormChannelId':
			case 'dailyChannelId':
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
			case 'pingRoleId':
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
		}

		if (interaction instanceof MessageComponentInteraction) {
			return interaction.update({
				content: `${MESSAGE_PREFIX} What would you like to change ${option} to?`,
				components,
			});
		}

		return interaction.reply({
			content: `${MESSAGE_PREFIX} What would you like to change ${option} to?`,
			components,
			ephemeral: true,
		});
	}
}
