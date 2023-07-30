export const escapeRegExp = (str: string) =>
	str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); // $& means the whole matched string
