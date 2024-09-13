import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { SentryInterceptor, SentryModule } from '@ntegral/nestjs-sentry';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { NecordModule } from 'necord';

import { AppEvents } from './events/app.events';
import { GuildEvents } from './events/guild.events';
import { InteractionEvents } from './events/interaction.events';
import { MetricsEvents } from './events/metrics.events';
import { botMetrics } from './metrics/bot.metrics';
import { channelMetrics } from './metrics/channel.metrics';
import { guildMetrics } from './metrics/guild.metrics';
import { interactionMetrics } from './metrics/interaction.metrics';
import { userMetrics } from './metrics/user.metrics';
import { LoggerMiddleware } from './middleware/log.middleware';
import {
	AdminModule,
	AuthModule,
	BookwormModule,
	DiscordModule,
	FeedbackModule,
	FunModule,
	HealthModule,
	MessageTriggerModule,
	MinecraftModule,
	ModLogModule,
	MusicModule,
	QotDModule,
	RadioModule,
	ReactionTriggerModule,
	RequestRoleModule,
	SettingsModule,
	TimezoneModule,
} from './modules';
import { SharedModule } from './shared.module';

import { intents } from '@util';


@Module({
	imports: [
		NecordModule.forRoot({
			development:
				process.env['NODE_ENV'] === 'production'
					? false
					: process.env['DEVELOPMENT_SERVER_IDS'].split(','),
			skipRegistration: process.env['REGISTER_COMMANDS'] === 'false',
			token: process.env['DISCORD_TOKEN'],
			intents,
		}),
		SentryModule.forRoot({
			dsn: process.env['SENTRY_DNS'],
			debug: process.env['NODE_ENV'] !== 'production',
			environment:
				process.env['NODE_ENV'] === 'production' ? 'production' : 'development',
			logLevels: ['error'],
			sampleRate: 1,
			close: {
				enabled: process.env['NODE_ENV'] === 'production',
				timeout: 5000,
			},
		}),
		EventEmitterModule.forRoot(),
		PrometheusModule.register(),
		ScheduleModule.forRoot(),

		// shared
		SharedModule,

		// Api
		HealthModule,
		AuthModule,
		DiscordModule,

		// Discord modules
		AdminModule,
		ModLogModule,
		TimezoneModule,
		FunModule,
		SettingsModule,
		BookwormModule,
		QotDModule,
		// MusicModule,
		MusicModule,
		ReactionTriggerModule,
		MessageTriggerModule,
		FeedbackModule,
		RadioModule,
		MinecraftModule,
		RequestRoleModule,
	],
	providers: [
		{
			provide: APP_INTERCEPTOR,
			useFactory: () => new SentryInterceptor(),
		},

		// prometheus
		...botMetrics,
		...guildMetrics,
		...channelMetrics,
		...userMetrics,
		...interactionMetrics,

		// events
		AppEvents,
		InteractionEvents,
		GuildEvents,
		MetricsEvents,
	],
})
export class MuseModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(LoggerMiddleware).forRoutes({
			path: '*',
			method: RequestMethod.ALL,
		});
	}
}
