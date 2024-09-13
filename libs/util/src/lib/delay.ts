export const delay = (time: number) =>
	new Promise(resolve => setTimeout(() => resolve(true), time));
