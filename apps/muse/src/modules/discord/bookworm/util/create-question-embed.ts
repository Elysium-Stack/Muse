import { EmbedBuilder, User } from 'discord.js';
import { BOOKWORM_EMBED_COLOR } from './constants';

export const createQuestionEmbed = (
	title: string,
	description: string,
	author: User,
) =>
	new EmbedBuilder()
		.setTitle(title)
		.setDescription(description)
		.setColor(BOOKWORM_EMBED_COLOR)
		.setTimestamp()
		.setFooter({
			text: 'Muse bookworm question',
			iconURL: author?.avatarURL() || undefined,
		});
