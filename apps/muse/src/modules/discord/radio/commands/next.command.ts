import { ForbiddenExceptionFilter, GuildAdminGuard } from '@muse/util';
import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import {
	Button,
	ButtonContext,
	Context,
	SlashCommandContext,
	Subcommand,
} from 'necord';
import { RadioCommandDecorator } from '../radio.decorator';
import { RadioService } from '../services';

@UseGuards(GuildAdminGuard)
@UseFilters(ForbiddenExceptionFilter)
@RadioCommandDecorator()
export class RadioNextCommands {
	private readonly _logger = new Logger(RadioNextCommands.name);

	constructor(private _radio: RadioService) {}

	@Subcommand({
		name: 'next',
		description: 'Play the next song in the queue',
	})
	public async next(@Context() [interaction]: SlashCommandContext) {
		return this._radio.next(interaction);
	}

	@Button('MUSIC_NEXT')
	public onButton(
		@Context()
		[interaction]: ButtonContext,
	) {
		return this._radio.next(interaction);
	}
}
