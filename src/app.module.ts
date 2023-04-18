import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { GatewayIntentBits } from 'discord.js';
import { NecordModule } from 'necord';
import { AppController } from './app.controller';
import { AppEvents } from './events/app.events';
import { AdminModule, BookwormModule } from './modules';
import { MusicModule } from './modules/music';
import { SettingsModule } from './modules/settings';
import { AppService } from './services';
import { SharedModule } from './shared.module';

@Module({
	imports: [
		NecordModule.forRoot({
			development:
				process.env.NODE_ENV !== 'production'
					? process.env.DEVELOPMENT_SERVER_IDS.split(',')
					: false,
			skipRegistration: true,
			token: process.env.DISCORD_TOKEN,
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.GuildMembers,
			],
		}),
		ScheduleModule.forRoot(),

		// shared
		SharedModule,

		// Custom modules
		AdminModule,
		SettingsModule,
		BookwormModule,
		MusicModule,
	],
	controllers: [AppController],
	providers: [AppService, AppEvents],
})
export class AppModule {}
