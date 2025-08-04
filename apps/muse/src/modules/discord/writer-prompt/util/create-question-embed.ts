import { EmbedBuilder, User } from 'discord.js';

import { WRITER_PROMPT_EMBED_COLOR } from './constants';

export const createPromptEmbed = (
	title: string,
	prompt: string,
	author: User
) =>
	new EmbedBuilder()
		.setTitle(title)
		.setDescription(prompt)
		.setColor(WRITER_PROMPT_EMBED_COLOR)
		.setTimestamp()
		.setFooter({
			text: 'Muse writer prompt',
			iconURL: author?.displayAvatarURL() || undefined,
		});
