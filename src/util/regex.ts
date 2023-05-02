export const escapeRegExp = (string: string) =>
	string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
