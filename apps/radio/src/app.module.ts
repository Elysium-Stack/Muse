import { intents } from '@muse/util';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { NecordModule } from 'necord';

@Module({
	imports: [
		NecordModule.forRoot({
			development:
				process.env.NODE_ENV !== 'production'
					? process.env.DEVELOPMENT_SERVER_IDS!.split(',')
					: false,
			skipRegistration: process.env.REGISTER_COMMANDS === 'false',
			token: process.env.RADIO_DISCORD_TOKEN!,
			intents,
		}),
		PrometheusModule.register(),
		ScheduleModule.forRoot(),
	],
})
export class AppModule {}
