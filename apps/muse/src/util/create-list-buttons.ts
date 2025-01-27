import { ButtonBuilder, ButtonStyle } from 'discord.js';

export const createListButtons = (
	command: string,
	page: number,
	maxPage: number
) => {
	const buttons = [];

	if (page > 2) {
		buttons.push(
			new ButtonBuilder()
				.setCustomId(`${command}/1`)
				.setLabel('⏪')
				.setStyle(ButtonStyle.Primary)
		);
	}

	if (page > 1) {
		buttons.push(
			new ButtonBuilder()
				.setCustomId(`${command}/${page - 1}`)
				.setLabel('◀️')
				.setStyle(ButtonStyle.Primary)
		);
	}

	if (page < maxPage) {
		buttons.push(
			new ButtonBuilder()
				.setCustomId(`${command}/${page + 1}`)
				.setLabel('▶️')
				.setStyle(ButtonStyle.Primary)
		);
	}

	if (page < maxPage - 1) {
		buttons.push(
			new ButtonBuilder()
				.setCustomId(`${command}/${maxPage}`)
				.setLabel('⏩')
				.setStyle(ButtonStyle.Primary)
		);
	}

	return buttons;
};
