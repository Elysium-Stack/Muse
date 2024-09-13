import { SharedModule } from '@muse/shared.module';
import { MusicModule as MusicLibModule } from '@music';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthController } from './controllers/health.controller';
import { LavalinkHealthService } from './services';
import { DiscordHealthService } from './services/discord-health.service';
import { PrismaHealthService } from './services/prisma-health.service';

@Module({
	imports: [SharedModule, HttpModule, TerminusModule, MusicLibModule],
	controllers: [HealthController],
	providers: [PrismaHealthService, DiscordHealthService, LavalinkHealthService],
})
export class HealthModule {}
