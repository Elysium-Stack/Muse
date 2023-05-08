import { Module } from '@nestjs/common';
import { FunDoggoCommands } from './commands/doggo.commands';
import { FunKittyCommands } from './commands/kitty.commands';
import { FunMessageEvents } from './events/message.events';
import { FunDoggoService } from './services/doggo.service';
import { FunKittyService } from './services/kitty.service';

@Module({
	imports: [],
	controllers: [],
	providers: [
		FunMessageEvents,

		FunKittyService,
		FunKittyCommands,
		FunDoggoService,
		FunDoggoCommands,
	],
	exports: [],
})
export class FunModule {}
