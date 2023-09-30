import { SharedModule } from '@muse/shared.module';
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RadioNextCommands } from './commands/next.command';
import { RadioPreviousCommands } from './commands/previous.command';
import { RadioStartCommands } from './commands/start.command';
import { RadioStopCommands } from './commands/stop.command';
import { RadioService } from './services';

@Module({
	imports: [
		ClientsModule.register([
			{
				name: 'RADIO_SERVICE',
				transport: Transport.RMQ,
				options: {
					urls: [
						`amqp://${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`,
					],
					queue: 'radio_queue',
					queueOptions: {
						durable: false,
					},
				},
			},
		]),
		SharedModule,
	],
	controllers: [],
	providers: [
		RadioService,
		RadioStartCommands,
		RadioStopCommands,
		RadioNextCommands,
		RadioPreviousCommands,
	],
	exports: [],
})
export class RadioModule {}
