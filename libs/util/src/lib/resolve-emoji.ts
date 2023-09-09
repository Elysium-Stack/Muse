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

	if (emojiId.indexOf(':') >= 0) {
		const splittedEmoji = emoji!.split(':');
		emojiId = splittedEmoji[splittedEmoji.length - 1].replace(/\>/g, '');
	}

	const clientEmoji = _client.emojis.resolve(emojiId);

	return {
		unicode: isUnicode,
		emoji: isUnicode ? emoji : clientEmoji?.id,
		clientEmoji,
		found: isUnicode || !!clientEmoji,
	};
};
