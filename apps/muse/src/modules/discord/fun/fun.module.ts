import { Module } from '@nestjs/common';
import { FunDoggoCommands } from './commands/doggo.commands';
import { FunFoxyCommands } from './commands/foxy.commands';
import { FunKittyCommands } from './commands/kitty.commands';
import { FunSayCommands } from './commands/say.commands';
import { FunMessageEvents } from './events/message.events';
import { FunDoggoService } from './services/doggo.service';
import { FunFoxyService } from './services/foxy.service';
import { FunKittyService } from './services/kitty.service';

@Module({
	imports: [],
	controllers: [],
	providers: [
		FunMessageEvents,

		FunSayCommands,

		FunKittyService,
		FunKittyCommands,

		FunDoggoService,
		FunDoggoCommands,

		FunFoxyService,
		FunFoxyCommands,
	],
	exports: [],
})
export class FunModule {}
