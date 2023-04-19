import { getHours, getMinutes, getSeconds } from 'date-fns';

export const readableTime = (ms: number) => {
	const date = new Date(ms);
	const hours = getHours(date);
	const minutes = getMinutes(date);
	const seconds = getSeconds(date);

	return `${hours < 10 ? `0${hours}` : hours}:${
		minutes < 10 ? `0${minutes}` : minutes
	}:${seconds < 10 ? `0${seconds}` : seconds}`;
};
