import { WinstonModule } from 'nest-winston';
import { format, transports, createLogger as wCreateLogger } from 'winston';
import LokiTransport from 'winston-loki';
import colors = require('colors/safe');

const getColor = (level: string) => {
	switch (level) {
		case 'error':
			return colors.red;
		case 'warn':
			return colors.yellow;
		case 'info':
			return colors.green;
		case 'debug':
			return colors.magenta;
		case 'log':
			return colors.cyan;
		default:
			return colors.white;
	}
};

export const createLogger = () => {
	const instance = wCreateLogger({
		transports: [
			...(process.env.LOKI_URL?.length
				? [
						new LokiTransport({
							host: process.env.LOKI_URL,
							interval: 5,
							labels: {
								app: `muse${
									process.env.NODE_ENV === 'production'
										? ''
										: '-development'
								}`,
							},
							json: true,
							format: format.json(),
							replaceTimestamp: true,
							gracefulShutdown: true,
							onConnectionError: (err) => console.error(err),
							level:
								process.env.NODE_ENV === 'production'
									? 'info'
									: 'debug',
						}),
				  ]
				: []),
			new transports.Console({
				level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
				format: format.printf(({ context, level, message }) => {
					return getColor(level)(
						`[Muse] ${process.pid} - ${colors.white(
							new Date().toLocaleString(),
						)}\t ${level.toUpperCase()} ${colors.yellow(
							`[${context || 'App'}]`,
						)}\t ${message}`,
					);
				}),
			}),
		],
	});

	return WinstonModule.createLogger({
		instance,
	});
};
