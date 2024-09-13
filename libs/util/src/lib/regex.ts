export const escapeRegExp = (str: string) =>
	str.replaceAll(/[$()*+./?[\\\]^{|}-]/g, String.raw`\$&`); // $& means the whole matched string
