export const stringToUuid = (i: string) =>
	i.slice(0, 8) +
	'-' +
	i.slice(8, 12) +
	'-' +
	i.slice(12, 16) +
	'-' +
	i.slice(16, 20) +
	'-' +
	i.slice(20);
