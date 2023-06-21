import { Module } from '@nestjs/common';
import { DeveloperLogModule } from '@util';
import { MusicLavalinkService, MusicPlayerService } from './services';

@Module({
	imports: [DeveloperLogModule],
	providers: [MusicLavalinkService, MusicPlayerService],
	exports: [MusicLavalinkService, MusicPlayerService],
})
export class MusicModule {}
