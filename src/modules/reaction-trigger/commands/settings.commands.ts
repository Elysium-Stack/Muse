import { GuildAdminGuard } from '@muse/guards';
import { MESSAGE_PREFIX } from '@muse/util/constants';
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
} from 'discord.js';
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
import { ForbiddenExceptionFilter } from 'src/filters';
import { ReactionTriggerCommandDecorator } from '../reaction-trigger.decorator';
import { ReactionTriggerSettingsService } from '../services/settings.service';
import { REACTION_TRIGGER_SETTINGS_CHOICES } from '../util/constants';

class ReactionTriggerSettingsChangeOptions {
	@StringOption({
		name: 'option',
		description: 'The option to change',
		required: false,
		choices: REACTION_TRIGGER_SETTINGS_CHOICES,
	})
	option: string;
}

@UseGuards(GuildAdminGuard)
@UseFilters(ForbiddenExceptionFilter)
@ReactionTriggerCommandDecorator({
	name: 'settings',
	description: 'Reaction trigger settings commands',
})
export class ReactionTriggerSettingsCommands {
	private readonly _logger = new Logger(ReactionTriggerSettingsCommands.name);

	constructor(private _settings: ReactionTriggerSettingsService) {}

	@Subcommand({
		name: 'show',
		description: 'Show reaction trigger settings',
	})
	public async show(@Context() [interaction]: SlashCommandContext) {
		this._logger.verbose(
			`Loaded reaction trigger settings for ${interaction.guildId}`,
		);

		return this._settings.showSettings(interaction);
	}

	@Button('REACTION_TRIGGER_SETTINGS_SHOW')
	public onShowButton(
		@Context()
		[interaction]: ButtonContext,
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
		@Options() { option }: ReactionTriggerSettingsChangeOptions,
	) {
		this._logger.verbose(
			`Change reaction trigger settings, option: ${option}`,
		);

		if (!option) {
			return this._settings.promptSettings(interaction);
		}

		return this._askSettingValue(interaction, option);
	}

	@Button('REACTION_TRIGGER_SETTINGS_PROMPT')
	public onPromptButton(
		@Context()
		[interaction]: ButtonContext,
	) {
		return this._settings.promptSettings(interaction);
	}

	@Button('REACTION_TRIGGER_SETTINGS_BACK')
	public onBackButton(
		@Context()
		[interaction]: ButtonContext,
	) {
		return this._settings.promptSettings(interaction);
	}

	@StringSelect('REACTION_TRIGGER_SETTINGS_CHANGE_SELECT')
	public onStringSelect(
		@Context() [interaction]: StringSelectContext,
		@SelectedStrings() selected: string[],
	) {
		return this._askSettingValue(interaction, selected[0]);
	}

	@Button('REACTION_TRIGGER_SETTINGS_CHANGE_ENABLED/:value')
	public async onEnabledButton(
		@Context() [interaction]: ButtonContext,
		@ComponentParam('value') value: string,
	) {
		const parsedValue = value === 'true' ? true : false;

		await this._settings.set(interaction.guildId, 'enabled', parsedValue);

		return interaction.update({
			content: `${MESSAGE_PREFIX} Reaction trigger has been ${
				parsedValue ? 'enabled' : 'disabled'
			}`,
			components: [this._getBackButtonRow()],
		});
	}

	@ChannelSelect('REACTION_TRIGGER_SETTINGS_CHANGE_IGNORED_CHANNEL_IDS')
	public async onChannelChange(
		@Context() [interaction]: ButtonContext,
		@SelectedChannels() data: ISelectedChannels,
	) {
		const ids = [...data.keys()];
		await this._settings.set(interaction.guildId, 'ignoredChannelIds', ids);

		return interaction.update({
			content: `${MESSAGE_PREFIX} Reaction trigger ignored channels has been changed to:${
				ids.length
					? `\n${ids.map((id) => `<#${id}>`).join(', ')}`
					: ' None'
			}`,
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
				readableOption = 'Enabled';
				currentValue = settings[option] ? 'Enabled' : 'Disabled';
				components = [
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder()
							.setCustomId(
								`REACTION_TRIGGER_SETTINGS_CHANGE_${camelCaseToSnakeCase(
									option,
								).toUpperCase()}/true`,
							)
							.setLabel('Enable')
							.setStyle(ButtonStyle.Primary)
							.setDisabled(settings[option] === true),
						new ButtonBuilder()
							.setCustomId(
								`REACTION_TRIGGER_SETTINGS_CHANGE_${camelCaseToSnakeCase(
									option,
								).toUpperCase()}/false`,
							)
							.setLabel('Disable')
							.setStyle(ButtonStyle.Danger)
							.setDisabled(settings[option] === false),
					),
				];
				break;
			case 'ignoredChannelIds':
				readableOption = 'Ignored channels';
				currentValue = settings[option]?.length
					? `\n${settings[option].map((id) => `<#${id}>`).join(', ')}`
					: 'none';
				components = [
					new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
						new ChannelSelectMenuBuilder()
							.setMinValues(1)
							.setMaxValues(25) // 25 is the max currently..
							.setCustomId(
								`REACTION_TRIGGER_SETTINGS_CHANGE_${camelCaseToSnakeCase(
									option,
								).toUpperCase()}`,
							)
							.addChannelTypes(ChannelType.GuildText)
							.setPlaceholder(
								'Select the channels to ignore (max 25)',
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
				.setCustomId(`REACTION_TRIGGER_SETTINGS_BACK`)
				.setLabel(
					isCancel ? 'Cancel' : 'Back to reaction trigger settings',
				)
				.setStyle(isCancel ? ButtonStyle.Danger : ButtonStyle.Primary),
		);
	}
}
