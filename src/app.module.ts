import { Module } from '@nestjs/common';
import { GatewayIntentBits } from 'discord.js';
import { NecordModule } from 'necord';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule, BookwormModule } from './modules';

@Module({
	imports: [
		NecordModule.forRoot({
			development:
				process.env.NODE_ENV !== 'production'
					? process.env.DEVELOPMENT_SERVER_IDS.split(',')
					: false,
			token: process.env.DISCORD_TOKEN,
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.GuildMembers,
			],
		}),

		// Custom modules
		AdminModule,
		BookwormModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
