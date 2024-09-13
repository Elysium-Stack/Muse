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
export class RadioStartCommands {
	private readonly _logger = new Logger(RadioStartCommands.name);

	constructor(private _radio: RadioService) {}

	@Subcommand({
		name: 'start',
		description: 'Start the radio',
	})
	public async start(@Context() [interaction]: SlashCommandContext) {
		return this._play(interaction);
	}

	@Button('RADIO_START')
	public onButton(
		@Context()
		[interaction]: ButtonContext
	) {
		return this._play(interaction);
	}

	private async _play(interaction) {
		return this._radio.start(interaction);
	}
}
