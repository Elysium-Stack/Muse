import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { SharedModule } from '@muse/shared.module';


import { HealthController } from './controllers/health.controller';
import { DiscordHealthService } from './services/discord-health.service';
import { PrismaHealthService } from './services/prisma-health.service';

@Module({
	imports: [SharedModule, HttpModule, TerminusModule],
	controllers: [HealthController],
	providers: [
		PrismaHealthService,
		DiscordHealthService,
	],
})
export class HealthModule {}
