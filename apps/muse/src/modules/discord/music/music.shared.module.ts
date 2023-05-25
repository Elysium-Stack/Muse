import { Module } from '@nestjs/common';
import { LavalinkService } from './services/lavalink.service';

@Module({
	imports: [],
	controllers: [],
	providers: [LavalinkService],
	exports: [LavalinkService],
})
export class MusicSharedModule {}
