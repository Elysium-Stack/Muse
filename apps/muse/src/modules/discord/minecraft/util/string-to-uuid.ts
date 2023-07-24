export const stringToUuid = (i: string) =>
	i.substring(0, 8) +
	'-' +
	i.substring(8, 12) +
	'-' +
	i.substring(12, 16) +
	'-' +
	i.substring(16, 20) +
	'-' +
	i.substring(20);
