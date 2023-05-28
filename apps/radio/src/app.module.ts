import { MusicModule } from '@music';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '@prisma';
import { intents } from '@util';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { NecordModule } from 'necord';
import { RadioController } from './controllers/radio.controller';
import { AppEvents } from './events/app.events';
import { RadioService } from './services/radio.service';
@Module({
	imports: [
		NecordModule.forRoot({
			development:
				process.env.NODE_ENV !== 'production'
					? process.env.DEVELOPMENT_SERVER_IDS!.split(',')
					: false,
			skipRegistration: true,
			token: process.env.RADIO_DISCORD_TOKEN!,
			intents,
		}),
		PrometheusModule.register(),
		ScheduleModule.forRoot(),

		PrismaModule,
		MusicModule,
	],
	controllers: [RadioController],
	providers: [RadioService, AppEvents],
})
export class AppModule {}
