import { Module } from '@nestjs/common';
import { FunAnimalCommands } from './commands/animal.commands';
import { FunSayCommands } from './commands/say.commands';
import { FunMessageEvents } from './events/message.events';
import { FunAnimalService } from './services';

@Module({
	imports: [],
	controllers: [],
	providers: [
		FunMessageEvents,

		FunSayCommands,

		FunAnimalService,
		FunAnimalCommands,
	],
	exports: [],
})
export class FunModule {}
