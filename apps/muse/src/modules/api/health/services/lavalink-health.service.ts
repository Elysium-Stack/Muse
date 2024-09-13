import { Injectable } from '@nestjs/common';
import {
	HealthCheckError,
	HealthIndicator,
	HealthIndicatorResult,
} from '@nestjs/terminus';

import { MusicLavalinkService } from '@music';

@Injectable()
export class LavalinkHealthService extends HealthIndicator {
	constructor(private readonly _lavalink: MusicLavalinkService) {
		super();
	}

	async pingCheck(): Promise<HealthIndicatorResult> {
		try {
			const status = await this._lavalink.getStatus();
			if (!status) {
				throw new Error('Lavalink unreachable');
			}

			return {
				lavalink: {
					status: status ? 'up' : 'down',
				},
			};
		} catch (error) {
			throw new HealthCheckError('Lavalink Health check failed', error);
		}
	}
}
