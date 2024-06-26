import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { DeveloperLogModule } from '@util';
import { MusicLavalinkService, MusicPlayerService } from './services';

@Module({
	imports: [DeveloperLogModule, EventEmitterModule, ScheduleModule],
	providers: [MusicLavalinkService, MusicPlayerService],
	exports: [MusicLavalinkService, MusicPlayerService],
})
export class MusicModule {}
