import { DiscordComponentsArrayDTO } from '@muse/types/discord-components-array.type';
import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import {
	ForbiddenExceptionFilter,
	MESSAGE_PREFIX,
	camelCaseToSnakeCase,
	resolveEmoji,
} from '@util';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelSelectMenuBuilder,
	ChannelType,
	CommandInteraction,
	MessageComponentInteraction,
	TextChannel,
} from 'discord.js';
import { GuildAdminGuard, GuildModeratorGuard } from 'libs/util/src/lib/guards';
import {
	Button,
	ButtonContext,
	ChannelOption,
	ChannelSelect,
	ComponentParam,
	Context,
	ISelectedChannels,
	NumberOption,
	Options,
	SelectedChannels,
	SelectedStrings,
	SlashCommandContext,
	StringOption,
	StringSelect,
	StringSelectContext,
	Subcommand,
} from 'necord';
import { StarboardSettingsService } from '../services/settings.service';
import { StarboardCommandDecorator } from '../starboard.decorator';
import { StarboardSettingsInterface } from '../types/settings.interface';
import { STARBOARD_SETTINGS_CHOICES } from '../util/constants';

class StarboardSettingsChangeOptions {
	@StringOption({
		name: 'option',
		description: 'The option to change',
		required: false,
		choices: STARBOARD_SETTINGS_CHOICES,
	})
	option: keyof StarboardSettingsInterface | undefined;
}

class StarboardIgnoreOptions {
	@ChannelOption({
		name: 'channel',
		description: 'The channel to ignore/unignore',
		required: false,
	})
	channel: TextChannel | undefined;
}

class StarboardSetEmojiOptions {
	@StringOption({
		name: 'emoji',
		description: 'The emoji to react with',
		required: true,
	})
	emojiString: string;
}

class StarboardSetTresholdOptions {
	@NumberOption({
		name: 'treshold',
		description: 'The treshold to set to',
		required: true,
	})
	treshold: string;
}

@UseFilters(ForbiddenExceptionFilter)
@StarboardCommandDecorator({
	name: 'settings',
	description: 'Starboard settings commands',
})
export class StarboardSettingsCommands {
	private readonly _logger = new Logger(StarboardSettingsCommands.name);

	constructor(private _settings: StarboardSettingsService) {}

	@UseGuards(GuildAdminGuard)
	@Subcommand({
		name: 'show',
		description: 'Show starboard settings',
	})
	public async show(@Context() [interaction]: SlashCommandContext) {
		this._logger.verbose(
			`Loaded starboard settings for ${interaction.guildId}`,
		);

		return this._settings.showSettings(interaction);
	}

	@UseGuards(GuildAdminGuard)
	@Subcommand({
		name: 'set-emoji',
		description: 'Show starboard settings',
	})
	public async setEmoji(
		@Context() [interaction]: SlashCommandContext,
		@Options() { emojiString }: StarboardSetEmojiOptions,
	) {
		const resolved = resolveEmoji(emojiString, interaction.client);
		const { found, unicode } = resolved;

		if (!found) {
			return interaction.reply({
				content: `${MESSAGE_PREFIX} You can only use emojis from guilds that the bot is in.`,
				ephemeral: true,
			});
		}

		const { emoji, clientEmoji } = resolved;

		await this._settings.set(interaction.guildId!, 'emoji', emoji);

		return interaction.reply({
			content: `${MESSAGE_PREFIX} Starboard reaction emoji has been set to ${
				unicode ? emoji : clientEmoji
			}.`,
			ephemeral: true,
			components: [this._getBackButtonRow()],
		});
	}

	@UseGuards(GuildAdminGuard)
	@Subcommand({
		name: 'set-treshold',
		description: 'Show starboard settings',
	})
	public async setTreshold(
		@Context() [interaction]: SlashCommandContext,
		@Options() { treshold }: StarboardSetTresholdOptions,
	) {
		const parsed = parseInt(treshold, 10);

		if (isNaN(parsed) || parsed < 1) {
			return interaction.reply({
				content: `${MESSAGE_PREFIX} Treshold must be atleast 1.`,
				ephemeral: true,
			});
		}

		await this._settings.set(interaction.guildId!, 'treshold', parsed);

		return interaction.reply({
			content: `${MESSAGE_PREFIX} Starboard treshold has been set to **${parsed}**.`,
			ephemeral: true,
			components: [this._getBackButtonRow()],
		});
	}

	@UseGuards(GuildModeratorGuard)
	@Subcommand({
		name: 'ignore',
		description: 'Ignore the current channel',
	})
	public async ignore(
		@Context() [interaction]: SlashCommandContext,
		@Options() { channel }: StarboardIgnoreOptions,
	) {
		this._logger.verbose(
			`Ignoring starboard channel for ${interaction.guildId} - ${
				channel?.id ?? interaction.channelId
			}`,
		);

		await this._settings.ignoreChannel(
			interaction.guildId,
			channel?.id ?? interaction.channelId,
			true,
		);

		return interaction.reply({
			content: `${MESSAGE_PREFIX} Starboard are now **ignored** for ${
				channel?.id ? `<#${channel.id}>` : 'this channel'
			}!`,
			ephemeral: true,
		});
	}

	@UseGuards(GuildModeratorGuard)
	@Subcommand({
		name: 'unignore',
		description: 'Unignore the current channel',
	})
	public async unignore(
		@Context() [interaction]: SlashCommandContext,
		@Options() { channel }: StarboardIgnoreOptions,
	) {
		this._logger.verbose(
			`Unignoring starboard channel for ${interaction.guildId} - ${
				channel?.id ?? interaction.channelId
			}`,
		);

		await this._settings.ignoreChannel(
			interaction.guildId,
			channel?.id ?? interaction.channelId,
			false,
		);

		return interaction.reply({
			content: `${MESSAGE_PREFIX} Starboards are now **unignored** for ${
				channel?.id ? `<#${channel.id}>` : 'this channel'
			}!`,
			ephemeral: true,
		});
	}

	@UseGuards(GuildAdminGuard)
	@Button('STARBOARD_SETTINGS_SHOW')
	public onShowButton(
		@Context()
		[interaction]: ButtonContext,
	) {
		return this._settings.showSettings(interaction);
	}

	// settings change flow
	@UseGuards(GuildAdminGuard)
	@Subcommand({
		name: 'change',
		description: 'Change settings',
	})
	public async changeSettings(
		@Context() [interaction]: SlashCommandContext,
		@Options() { option }: StarboardSettingsChangeOptions,
	) {
		this._logger.verbose(`Change starboard settings, option: ${option}`);

		if (!option) {
			return this._settings.promptSettings(interaction);
		}

		return this._askSettingValue(interaction, option);
	}

	@UseGuards(GuildAdminGuard)
	@Button('STARBOARD_SETTINGS_PROMPT')
	public onPromptButton(
		@Context()
		[interaction]: ButtonContext,
	) {
		return this._settings.promptSettings(interaction);
	}

	@UseGuards(GuildAdminGuard)
	@Button('STARBOARD_SETTINGS_BACK')
	public onBackButton(
		@Context()
		[interaction]: ButtonContext,
	) {
		return this._settings.promptSettings(interaction);
	}

	@UseGuards(GuildAdminGuard)
	@StringSelect('STARBOARD_SETTINGS_CHANGE_SELECT')
	public onStringSelect(
		@Context() [interaction]: StringSelectContext,
		@SelectedStrings() selected: (keyof StarboardSettingsInterface)[],
	) {
		return this._askSettingValue(interaction, selected[0]);
	}

	@UseGuards(GuildAdminGuard)
	@Button('STARBOARD_SETTINGS_CHANGE_ENABLED/:value')
	public async onEnabledButton(
		@Context() [interaction]: ButtonContext,
		@ComponentParam('value') value: string,
	) {
		const parsedValue = value === 'true' ? true : false;

		await this._settings.set(interaction.guildId!, 'enabled', parsedValue);

		return interaction.update({
			content: `${MESSAGE_PREFIX} Starboard has been ${
				parsedValue ? 'enabled' : 'disabled'
			}`,
			components: [this._getBackButtonRow()],
		});
	}

	@UseGuards(GuildAdminGuard)
	@Button('STARBOARD_SETTINGS_CHANGE_SELF/:value')
	public async onSelfEnabledButton(
		@Context() [interaction]: ButtonContext,
		@ComponentParam('value') value: string,
	) {
		const parsedValue = value === 'true' ? true : false;

		await this._settings.set(interaction.guildId!, 'self', parsedValue);

		return interaction.update({
			content: `${MESSAGE_PREFIX} Author starring has been ${
				parsedValue ? 'enabled' : 'disabled'
			}`,
			components: [this._getBackButtonRow()],
		});
	}

	@UseGuards(GuildAdminGuard)
	@ChannelSelect('STARBOARD_SETTINGS_CHANGE_IGNORED_CHANNEL_IDS')
	public async onIgnoredChannelsChange(
		@Context() [interaction]: ButtonContext,
		@SelectedChannels() data: ISelectedChannels,
	) {
		const ids = [...data.keys()];
		await this._settings.set(
			interaction.guildId!,
			'ignoredChannelIds',
			ids,
		);

		return interaction.update({
			content: `${MESSAGE_PREFIX} Starboard ignored channels has been changed to:${
				ids.length
					? `\n${ids.map((id) => `<#${id}>`).join(', ')}`
					: ' None'
			}`,
			components: [this._getBackButtonRow()],
		});
	}

	@UseGuards(GuildAdminGuard)
	@ChannelSelect('STARBOARD_SETTINGS_CHANGE_CHANNEL_ID')
	public async onChannelChange(
		@Context() [interaction]: ButtonContext,
		@SelectedChannels() data: ISelectedChannels,
	) {
		const id = [...data.keys()][0];
		await this._settings.set(interaction.guildId!, 'channelId', id);

		return interaction.update({
			content: `${MESSAGE_PREFIX} Starboard default channel has been set to: ${
				id.length ? `\n<#${id}>` : ' None'
			}`,
			components: [this._getBackButtonRow()],
		});
	}

	private async _askSettingValue(
		interaction: MessageComponentInteraction | CommandInteraction,
		option: keyof StarboardSettingsInterface,
	) {
		let components: DiscordComponentsArrayDTO = [];
		const settings = await this._settings.get(interaction.guildId!);

		let currentValue: string | boolean | string[] | number =
			settings?.[option];
		let readableOption: string = option;

		switch (option) {
			case 'enabled':
				readableOption = 'Enabled';
				currentValue = settings?.[option] ? 'Enabled' : 'Disabled';
				components = [
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder()
							.setCustomId(
								`STARBOARD_SETTINGS_CHANGE_${camelCaseToSnakeCase(
									option,
								).toUpperCase()}/true`,
							)
							.setLabel('Enable')
							.setStyle(ButtonStyle.Primary)
							.setDisabled(settings?.[option] === true),
						new ButtonBuilder()
							.setCustomId(
								`STARBOARD_SETTINGS_CHANGE_${camelCaseToSnakeCase(
									option,
								).toUpperCase()}/false`,
							)
							.setLabel('Disable')
							.setStyle(ButtonStyle.Danger)
							.setDisabled(settings?.[option] === false),
					),
				];
				break;
			case 'channelId':
				readableOption = 'Channel';
				currentValue = settings?.[option]?.length
					? `<#${settings?.[option]}>`
					: 'none';
				components = [
					new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
						new ChannelSelectMenuBuilder()
							.setCustomId(
								`STARBOARD_SETTINGS_CHANGE_${camelCaseToSnakeCase(
									option,
								).toUpperCase()}`,
							)
							.addChannelTypes(ChannelType.GuildText)
							.setPlaceholder(
								'Select the channel to use as a starboard default',
							),
					),
				];
				break;
			case 'self':
				readableOption = 'Enabled';
				currentValue = settings?.[option] ? 'Enabled' : 'Disabled';
				components = [
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder()
							.setCustomId(
								`STARBOARD_SETTINGS_CHANGE_${camelCaseToSnakeCase(
									option,
								).toUpperCase()}/true`,
							)
							.setLabel('Enable')
							.setStyle(ButtonStyle.Primary)
							.setDisabled(settings?.[option] === true),
						new ButtonBuilder()
							.setCustomId(
								`STARBOARD_SETTINGS_CHANGE_${camelCaseToSnakeCase(
									option,
								).toUpperCase()}/false`,
							)
							.setLabel('Disable')
							.setStyle(ButtonStyle.Danger)
							.setDisabled(settings?.[option] === false),
					),
				];
				break;
			case 'ignoredChannelIds':
				readableOption = 'Ignored channels';
				currentValue = settings?.[option]?.length
					? `\n${settings[option].map((id) => `<#${id}>`).join(', ')}`
					: 'none';
				components = [
					new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
						new ChannelSelectMenuBuilder()
							.setMinValues(1)
							.setMaxValues(25) // 25 is the max currently..
							.setCustomId(
								`STARBOARD_SETTINGS_CHANGE_${camelCaseToSnakeCase(
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
				.setCustomId(`STARBOARD_SETTINGS_BACK`)
				.setLabel(isCancel ? 'Cancel' : 'Back to starboard settings')
				.setStyle(isCancel ? ButtonStyle.Danger : ButtonStyle.Primary),
		);
	}
}
