import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import { ForbiddenExceptionFilter, GuildModeratorGuard } from '@util';
import {
	Button,
	ButtonContext,
	Context,
	SlashCommandContext,
	Subcommand,
} from 'necord';
import { RadioCommandDecorator } from '../radio.decorator';
import { RadioService } from '../services';

@UseGuards(GuildModeratorGuard)
@UseFilters(ForbiddenExceptionFilter)
@RadioCommandDecorator()
export class RadioStopCommands {
	private readonly _logger = new Logger(RadioStopCommands.name);

	constructor(private _radio: RadioService) {}

	@Subcommand({
		name: 'stop',
		description: 'Stop the radio',
	})
	public async stop(@Context() [interaction]: SlashCommandContext) {
		return this._stop(interaction);
	}

	@Button('RADIO_STOP')
	public onButton(
		@Context()
		[interaction]: ButtonContext,
	) {
		return this._stop(interaction);
	}

	private async _stop(interaction) {
		return this._radio.stop(interaction);
	}
}
