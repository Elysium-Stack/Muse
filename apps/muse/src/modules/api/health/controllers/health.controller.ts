import { Controller, Get, Inject } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import {
	DiskHealthIndicator,
	HealthCheck,
	HealthCheckService,
	HttpHealthIndicator,
	MemoryHealthIndicator,
} from '@nestjs/terminus';

import { DiscordHealthService } from '../services/discord-health.service';
import { LavalinkHealthService } from '../services/lavalink-health.service';
import { PrismaHealthService } from '../services/prisma-health.service';

@Controller('health')
export class HealthController {
	constructor(
		private health: HealthCheckService,
		private http: HttpHealthIndicator,
		@Inject(PrismaHealthService)
		private db: PrismaHealthService,
		@Inject(DiscordHealthService)
		private discord: DiscordHealthService,
		@Inject(LavalinkHealthService)
		private lavalink: LavalinkHealthService,
		private disk: DiskHealthIndicator,
		private memory: MemoryHealthIndicator
	) {}

	@Get()
	@ApiExcludeEndpoint(true)
	@HealthCheck()
	check() {
		return this.health.check([
			() =>
				this.http.pingCheck(
					'basic check',
					'http://localhost:3000/api/health/ping',
					{
						timeout: 100,
					}
				),
			() =>
				this.disk.checkStorage('diskStorage', {
					thresholdPercent: 0.5,
					path: '/',
				}),
			() => this.db.pingCheck('muse'),
			() => this.discord.pingCheck(),
			() => this.lavalink.pingCheck(),
			() => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
			() => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),

			// Mongoose for MongoDB check
			// Redis check
		]);
	}

	@Get('ping')
	@ApiExcludeEndpoint(true)
	ping() {
		return 'pong!';
	}
}
