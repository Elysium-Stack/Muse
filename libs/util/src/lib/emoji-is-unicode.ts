export const emojiIsUnicode = (emoji) =>
	/\p{Extended_Pictographic}/gu.test(emoji);
