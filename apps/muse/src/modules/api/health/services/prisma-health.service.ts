import { Injectable } from '@nestjs/common';
import {
	HealthCheckError,
	HealthIndicator,
	HealthIndicatorResult,
} from '@nestjs/terminus';
import { PrismaService } from '@prisma';

@Injectable()
export class PrismaHealthService extends HealthIndicator {
	constructor(private readonly prismaService: PrismaService) {
		super();
	}

	async pingCheck(databaseName: string): Promise<HealthIndicatorResult> {
		try {
			await this.prismaService.$queryRaw`SELECT 1`;
			return this.getStatus(databaseName, true);
		} catch (error) {
			throw new HealthCheckError('Prisma Health check failed', error);
		}
	}
}
