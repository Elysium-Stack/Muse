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
export class RadioPreviousCommands {
	private readonly _logger = new Logger(RadioPreviousCommands.name);

	constructor(private _radio: RadioService) {}

	@Subcommand({
		name: 'previous',
		description: 'Play the previous song in the queue',
	})
	public async previous(@Context() [interaction]: SlashCommandContext) {
		return this._radio.previous(interaction);
	}

	@Button('MUSIC_PREVIOUS')
	public onButton(
		@Context()
		[interaction]: ButtonContext,
	) {
		return this._radio.previous(interaction);
	}
}
