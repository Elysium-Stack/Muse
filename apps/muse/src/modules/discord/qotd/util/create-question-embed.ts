import { EmbedBuilder, User } from 'discord.js';
import { QOTD_EMBED_COLOR } from './constants';

export const createQuestionEmbed = (
	title: string,
	description: string,
	author: User,
) =>
	new EmbedBuilder()
		.setTitle(title)
		.setDescription(description)
		.setColor(QOTD_EMBED_COLOR)
		.setTimestamp()
		.setFooter({
			text: 'Muse qotd question',
			iconURL: author?.displayAvatarURL() || undefined,
		});
