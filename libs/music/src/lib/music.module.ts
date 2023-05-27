import { Module } from '@nestjs/common';
import { MusicLavalinkService, MusicPlayerService } from './services';

@Module({
	providers: [MusicLavalinkService, MusicPlayerService],
	exports: [MusicLavalinkService, MusicPlayerService],
})
export class MusicModule {}
