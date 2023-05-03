import { Module } from '@nestjs/common';
import { FunDoggoCommands } from './commands/doggo.commands';
import { FunKittyCommands } from './commands/kitty.commands';
import { FunDoggoService } from './services/doggo.service';
import { FunKittyService } from './services/kitty.service';

@Module({
	imports: [],
	controllers: [],
	providers: [
		FunKittyService,
		FunKittyCommands,
		FunDoggoService,
		FunDoggoCommands,
	],
	exports: [],
})
export class FunModule {}
