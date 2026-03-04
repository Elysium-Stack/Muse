import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelSelectMenuBuilder,
	ChannelType,
	CommandInteraction,
	MessageComponentInteraction,
	ModalActionRowComponentBuilder,
	ModalBuilder,
	RoleSelectMenuBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';
import {
	Button,
	ButtonContext,
	ChannelSelect,
	ComponentParam,
	Context,
	Ctx,
	ISelectedChannels,
	ISelectedRoles,
	Modal,
	ModalContext,
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

import { MinecraftCommandDecorator } from '../minecraft.decorator';
import { MinecraftSettingsService } from '../services/settings.service';
import { MinecraftSettingsInterface } from '../types/settings.interface';
import { MINECRAFT_SETTINGS_CHOICES } from '../util/constants';

import { DiscordComponentsArrayDTO } from '@muse/types/discord-components-array.type';

import {
	ForbiddenExceptionFilter,
	GuildAdminGuard,
	MESSAGE_PREFIX,
	camelCaseToSnakeCase,
} from '@util';
class MinecraftSettingsChangeOptions {
	@StringOption({
		name: 'option',
		description: 'The option to change',
		required: false,
		choices: MINECRAFT_SETTINGS_CHOICES,
	})
	option: keyof MinecraftSettingsInterface | undefined;
}

@UseGuards(GuildAdminGuard)
@UseFilters(ForbiddenExceptionFilter)
@MinecraftCommandDecorator({
	name: 'settings',
	description: 'Minecraft settings commands',
})
export class MinecraftSettingsCommands {
	private readonly _logger = new Logger(MinecraftSettingsCommands.name);

	constructor(private _settings: MinecraftSettingsService) {}

	@Subcommand({
		name: 'show',
		description: 'Show minecraft settings',
	})
	public async show(@Context() [interaction]: SlashCommandContext) {
		this._logger.verbose(
			`Loaded minecraft settings for ${interaction.guildId}`
		);

		return this._settings.showSettings(interaction);
	}

	@Button('MINECRAFT_SETTINGS_SHOW')
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
		@Options() { option }: MinecraftSettingsChangeOptions
	) {
		this._logger.verbose(`Change minecraft settings, option: ${option}`);

		if (!option) {
			return this._settings.promptSettings(interaction);
		}

		return this._askSettingValue(interaction, option);
	}

	@Button('MINECRAFT_SETTINGS_PROMPT')
	public onPromptButton(
		@Context()
		[interaction]: ButtonContext
	) {
		return this._settings.promptSettings(interaction);
	}

	@Button('MINECRAFT_SETTINGS_BACK')
	public onBackButton(
		@Context()
		[interaction]: ButtonContext
	) {
		return this._settings.promptSettings(interaction);
	}

	@StringSelect('MINECRAFT_SETTINGS_CHANGE_SELECT')
	public onStringSelect(
		@Context() [interaction]: StringSelectContext,
		@SelectedStrings() selected: (keyof MinecraftSettingsInterface)[]
	) {
		return this._askSettingValue(interaction, selected[0]);
	}

	@Button('MINECRAFT_SETTINGS_CHANGE_ENABLED/:value')
	public async onEnabledButton(
		@Context() [interaction]: ButtonContext,
		@ComponentParam('value') value: string
	) {
		const parsedValue = value === 'true' ? true : false;

		await this._settings.set(interaction.guildId, 'enabled', parsedValue);

		return interaction.update({
			content: `${MESSAGE_PREFIX} Minecraft has been ${
				parsedValue ? 'enabled' : 'disabled'
			}`,
			components: [this._getBackButtonRow()],
		});
	}

	@Button('MINECRAFT_SETTINGS_CHANGE_BEDROCK_ENABLED/:value')
	public async onBedrockEnabledButton(
		@Context() [interaction]: ButtonContext,
		@ComponentParam('value') value: string
	) {
		const parsedValue = value === 'true' ? true : false;

		await this._settings.set(
			interaction.guildId,
			'bedrockEnabled',
			parsedValue
		);

		return interaction.update({
			content: `${MESSAGE_PREFIX} Bedrock has been ${
				parsedValue ? 'enabled' : 'disabled'
			}`,
			components: [this._getBackButtonRow()],
		});
	}

	@RoleSelect('MINECRAFT_SETTINGS_CHANGE_REQUIRED_ROLE_ID')
	public async onRequiredRoleChange(
		@Context() [interaction]: ButtonContext,
		@SelectedRoles() [[id]]: ISelectedRoles
	) {
		await this._settings.set(interaction.guildId, 'requiredRoleId', id);

		return interaction.update({
			content: `${MESSAGE_PREFIX} Minecraft required role has been changed to <@&${id}>`,
			components: [this._getBackButtonRow()],
		});
	}

	@Modal('MINECRAFT_SETTINGS_CHANGE_CONNECTION_INFORMATION')
	public async onConnectionUrlsModalResponse(
		@Ctx() [interaction]: ModalContext
	) {
		const connectUrl = interaction.fields.getTextInputValue('connectUrl');
		const bedrockPort = interaction.fields.getTextInputValue('bedrockPort');
		if (
			bedrockPort.length > 0 &&
			Number.isNaN(Number.parseInt(bedrockPort, 10))
		) {
			return interaction.reply({
				content: `${MESSAGE_PREFIX} Bedrock port must be a number.`,
				components: [this._getBackButtonRow()],
			});
		}

		await this._settings.setObj(interaction.guildId, {
			connectUrl,
			bedrockPort,
		});

		return interaction.reply({
			content: `${MESSAGE_PREFIX} Minecraft connection url's have been changed.`,
			components: [this._getBackButtonRow()],
		});
	}

	@Modal('MINECRAFT_SETTINGS_CHANGE_RCON_CONNECTION')
	public async onRconConnectionModalResponse(
		@Ctx() [interaction]: ModalContext
	) {
		const rconPort = interaction.fields.getTextInputValue('rconPort');
		if (Number.isNaN(Number.parseInt(rconPort, 10))) {
			return interaction.reply({
				content: `${MESSAGE_PREFIX} Port must be a number.`,
				components: [this._getBackButtonRow()],
			});
		}

		const rconHost = interaction.fields.getTextInputValue('rconHost');
		const rconPass = interaction.fields.getTextInputValue('rconPass');

		await this._settings.setObj(interaction.guildId, {
			rconHost,
			rconPort,
			...(rconPass?.length ? { rconPass } : {}),
		});

		return interaction.reply({
			content: `${MESSAGE_PREFIX} RCON connection has been changed.`,
			components: [this._getBackButtonRow()],
		});
	}

	@ChannelSelect('MINECRAFT_SETTINGS_CHANGE_CHAT_CHANNEL_ID')
	public async onChatChannelChange(
		@Context() [interaction]: ButtonContext,
		@SelectedChannels() data: ISelectedChannels
	) {
		const id = [...data.keys()][0];
		await this._settings.set(interaction.guildId, 'chatChannelId', id);

		return interaction.update({
			content: `${MESSAGE_PREFIX} Minecraft Chat Channel changed to:${
				id.length > 0 ? `\n<#${id}>` : ' None'
			}`,
			components: [this._getBackButtonRow()],
		});
	}

	private async _askSettingValue(
		interaction: MessageComponentInteraction | CommandInteraction,
		option: string
	) {
		let components: DiscordComponentsArrayDTO = [];
		const settings = await this._settings.get(interaction.guildId);

		let currentValue = settings?.[option];
		let readableOption: string = option;

		switch (option) {
			case 'enabled': {
				readableOption = 'Enabled';
				currentValue = settings?.[option] ? 'Enabled' : 'Disabled';
				components = [
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder()
							.setCustomId(
								`MINECRAFT_SETTINGS_CHANGE_${camelCaseToSnakeCase(
									option
								).toUpperCase()}/true`
							)
							.setLabel('Enable')
							.setStyle(ButtonStyle.Primary)
							.setDisabled(settings?.[option] === true),
						new ButtonBuilder()
							.setCustomId(
								`MINECRAFT_SETTINGS_CHANGE_${camelCaseToSnakeCase(
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
			case 'bedrockEnabled': {
				readableOption = 'Bedrock enabled';
				currentValue = settings?.[option] ? 'Enabled' : 'Disabled';
				components = [
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder()
							.setCustomId(
								`MINECRAFT_SETTINGS_CHANGE_${camelCaseToSnakeCase(
									option
								).toUpperCase()}/true`
							)
							.setLabel('Enable')
							.setStyle(ButtonStyle.Primary)
							.setDisabled(settings?.[option] === true),
						new ButtonBuilder()
							.setCustomId(
								`MINECRAFT_SETTINGS_CHANGE_${camelCaseToSnakeCase(
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
			case 'requiredRoleId': {
				readableOption = 'Required role';
				currentValue = settings?.[option]
					? `<@&${settings[option]}>`
					: 'none';
				components = [
					new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
						new RoleSelectMenuBuilder()
							.setCustomId(
								`MINECRAFT_SETTINGS_CHANGE_${camelCaseToSnakeCase(
									option
								).toUpperCase()}`
							)
							.setPlaceholder('Select a role')
					),
				];
				break;
			}
			case 'chatChannelId': {
				readableOption = 'Chat Channel';
				currentValue = settings?.[option]?.length
					? `<#${settings?.[option]}>`
					: 'none';
				components = [
					new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
						new ChannelSelectMenuBuilder()
							.setCustomId(
								`MINECRAFT_SETTINGS_CHANGE_${camelCaseToSnakeCase(
									option
								).toUpperCase()}`
							)
							.addChannelTypes(ChannelType.GuildText)
							.setPlaceholder(
								'Select the channel to listen for chats'
							)
					),
				];
				break;
			}
			case 'connectionInformation': {
				readableOption = 'Connection Information';
				currentValue = settings?.[option] ?? 'none';
				const modal = new ModalBuilder()
					.setTitle('Change your onnection information')
					.setCustomId(
						`MINECRAFT_SETTINGS_CHANGE_${camelCaseToSnakeCase(
							option
						).toUpperCase()}`
					)
					.setComponents([
						new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
							[
								new TextInputBuilder()
									.setCustomId('connectUrl')
									.setLabel('Connect url')
									.setValue(settings.connectUrl ?? '')
									.setStyle(TextInputStyle.Short),
							]
						),
						new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
							[
								new TextInputBuilder()
									.setCustomId('bedrockPort')
									.setLabel('Bedrock port')
									.setValue(settings.bedrockPort ?? '')
									.setStyle(TextInputStyle.Short)
									.setRequired(false),
							]
						),
					]);
				return interaction.showModal(modal);
			}
			case 'rconConnection': {
				readableOption = 'RCON Connection';
				currentValue = settings?.[option] ?? 'none';
				const rconModal = new ModalBuilder()
					.setTitle('Change RCON connection')
					.setCustomId(
						`MINECRAFT_SETTINGS_CHANGE_${camelCaseToSnakeCase(
							option
						).toUpperCase()}`
					)
					.setComponents([
						new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
							[
								new TextInputBuilder()
									.setCustomId('rconHost')
									.setLabel('Host')
									.setValue(settings.rconHost ?? '')
									.setStyle(TextInputStyle.Short),
							]
						),
						new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
							[
								new TextInputBuilder()
									.setCustomId('rconPort')
									.setLabel('Port')
									.setValue(settings.rconPort ?? '')
									.setStyle(TextInputStyle.Short),
							]
						),
						new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
							[
								new TextInputBuilder()
									.setCustomId('rconPass')
									.setLabel('Password')
									.setStyle(TextInputStyle.Short)
									.setRequired(false),
							]
						),
					]);
				return interaction.showModal(rconModal);
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
				.setCustomId(`MINECRAFT_SETTINGS_BACK`)
				.setLabel(isCancel ? 'Cancel' : 'Back to minecraft settings')
				.setStyle(isCancel ? ButtonStyle.Danger : ButtonStyle.Primary)
		);
	}
}
