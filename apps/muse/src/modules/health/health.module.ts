import { SharedModule } from '@muse/shared.module';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { MusicSharedModule } from '../music/music.shared.module';
import { HealthController } from './controllers/health.controller';
import { LavalinkHealthService } from './services';
import { DiscordHealthService } from './services/discord-health.service';
import { PrismaHealthService } from './services/prisma-health.service';

@Module({
	imports: [SharedModule, HttpModule, TerminusModule, MusicSharedModule],
	controllers: [HealthController],
	providers: [
		PrismaHealthService,
		DiscordHealthService,
		LavalinkHealthService,
	],
})
export class HealthModule {}
