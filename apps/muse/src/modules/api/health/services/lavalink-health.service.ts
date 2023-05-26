import { LavalinkService } from '@muse/modules/discord/music/services/lavalink.service';
import { Injectable } from '@nestjs/common';
import {
	HealthCheckError,
	HealthIndicator,
	HealthIndicatorResult,
} from '@nestjs/terminus';

@Injectable()
export class LavalinkHealthService extends HealthIndicator {
	constructor(private readonly _lavalink: LavalinkService) {
		super();
	}

	async pingCheck(): Promise<HealthIndicatorResult> {
		try {
			const status = await this._lavalink.getStatus();
			if (!status) {
				throw new Error();
			}

			return {
				lavalink: {
					status: status ? 'up' : 'down',
				},
			};
		} catch (e) {
			throw new HealthCheckError('Lavalink Health check failed', e);
		}
	}
}