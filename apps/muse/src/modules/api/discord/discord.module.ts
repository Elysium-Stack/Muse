import { Module } from '@nestjs/common';

import { SharedModule } from '@muse/shared.module';

import { GuildsController } from './controllers/guilds.controller';
import { DiscordSharedModule } from './discord.shared.module';

@Module({
	imports: [SharedModule, DiscordSharedModule],
	controllers: [GuildsController],
	providers: [],
})
export class DiscordModule {}
