import { ButtonBuilder, ButtonStyle } from 'discord.js';

export const ALL_SETTINGS_BUTTON = new ButtonBuilder()
	.setCustomId('SETTINGS_SHOW')
	.setLabel('All settings')
	.setStyle(ButtonStyle.Secondary);
