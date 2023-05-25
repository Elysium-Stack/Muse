import { PrismaService } from '@muse/modules/prisma';
import { Injectable } from '@nestjs/common';
import {
	HealthCheckError,
	HealthIndicator,
	HealthIndicatorResult,
} from '@nestjs/terminus';

@Injectable()
export class PrismaHealthService extends HealthIndicator {
	constructor(private readonly prismaService: PrismaService) {
		super();
	}

	async pingCheck(databaseName: string): Promise<HealthIndicatorResult> {
		try {
			await this.prismaService.$queryRaw`SELECT 1`;
			return this.getStatus(databaseName, true);
		} catch (e) {
			throw new HealthCheckError('Prisma Health check failed', e);
		}
	}
}
