import { Client, GuildEmoji } from 'discord.js';

import { emojiIsUnicode } from './emoji-is-unicode';

export const resolveEmoji = (
	emoji: string,
	_client: Client,
): {
	found: boolean;
	unicode: boolean;
	emoji?: GuildEmoji | string;
	clientEmoji?: GuildEmoji;
} => {
	if (!emoji?.length) {
		return {
			found: false,
			unicode: false,
		};
	}

	const isUnicode = emojiIsUnicode(emoji);

	let emojiId = emoji;

	if (emojiId.includes(':')) {
		const splittedEmoji = emoji!.split(':');
		emojiId = splittedEmoji.at(-1).replaceAll('>', '');
	}

	const clientEmoji = _client.emojis.resolve(emojiId);

	return {
		unicode: isUnicode,
		emoji: isUnicode ? emoji : clientEmoji?.id,
		clientEmoji,
		found: isUnicode || !!clientEmoji,
	};
};
