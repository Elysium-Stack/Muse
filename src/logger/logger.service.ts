import { ConsoleLogger } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

export class MuseLogger extends ConsoleLogger {
	constructor(
		@InjectMetric('logging_total')
		public loggingTotal: Counter<string>,
	) {
		super();
	}
	/**
	 * Write a 'log' level log.
	 */
	log(message: any, ...optionalParams: any[]) {
		this._log(message);
		super.log(message, ...optionalParams);
	}

	/**
	 * Write an 'error' level log.
	 */
	error(message: any, ...optionalParams: any[]) {
		this._log(message, 'error');
		super.error(message, ...optionalParams);
	}

	/**
	 * Write a 'warn' level log.
	 */
	warn(message: any, ...optionalParams: any[]) {
		this._log(message, 'warn');
		super.warn(message, ...optionalParams);
	}

	/**
	 * Write a 'debug' level log.
	 */
	debug(message: any, ...optionalParams: any[]) {
		this._log(message, 'debug');
		super.debug(message, ...optionalParams);
	}

	/**
	 * Write a 'verbose' level log.
	 */
	verbose(message: any, ...optionalParams: any[]) {
		this._log(message, 'verbose');
		super.verbose(message, ...optionalParams);
	}

	/**
	 * Set metric
	 */
	_log(
		name: string,
		levelName: 'log' | 'error' | 'warn' | 'debug' | 'verbose' = 'log',
	) {
		this.loggingTotal.labels(name, levelName).inc();
	}
}
