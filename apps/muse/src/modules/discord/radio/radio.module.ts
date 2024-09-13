import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { SharedModule } from '@muse/shared.module';

import { RadioNextCommands } from './commands/next.command';
import { RadioPreviousCommands } from './commands/previous.command';
import { RadioQueueCommands } from './commands/queue.command';
import { RadioStartCommands } from './commands/start.command';
import { RadioStopCommands } from './commands/stop.command';
import { RadioService } from './services';

@Module({
	imports: [
		ClientsModule.register([
			{
				name: 'RADIO_SERVICE',
				transport: Transport.TCP,
				options: {
					host: process.env['RADIO_BOT_HOST'],
					port: 1337,
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
		RadioQueueCommands,
	],
	exports: [],
})
export class RadioModule {}
