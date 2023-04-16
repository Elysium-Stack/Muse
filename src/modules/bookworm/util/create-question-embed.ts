import { EmbedBuilder, User } from 'discord.js';

export const createQuestionEmbed = (
	title: string,
	description: string,
	author: User,
) =>
	new EmbedBuilder()
		.setTitle(title)
		.setDescription(description)
		.setTimestamp()
		.setFooter({
			text: 'Muse bookworm question',
			iconURL: author.avatarURL(),
		});
