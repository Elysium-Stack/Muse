import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';

import { MusicLavalinkService, MusicPlayerService } from './services';

import { DeveloperLogModule } from '@util';


@Module({
	imports: [DeveloperLogModule, EventEmitterModule, ScheduleModule],
	providers: [MusicLavalinkService, MusicPlayerService],
	exports: [MusicLavalinkService, MusicPlayerService],
})
export class MusicModule {}
