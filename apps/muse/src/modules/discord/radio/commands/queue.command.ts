import { Logger } from '@nestjs/common';
import {
	Button,
	ButtonContext,
	ComponentParam,
	Context,
	NumberOption,
	Options,
	SlashCommandContext,
	Subcommand,
} from 'necord';

import { RadioCommandDecorator } from '../radio.decorator';
import { RadioService } from '../services';

class RadioQueueOptions {
	@NumberOption({
		name: 'page',
		description: 'The page of the queue you want to view',
		min_value: 0,
		max_value: 100,
	})
	page: number | undefined;
}

@RadioCommandDecorator()
export class RadioQueueCommands {
	private readonly _logger = new Logger(RadioQueueCommands.name);

	constructor(private _radio: RadioService) {}

	@Subcommand({
		name: 'queue',
		description: 'Get the current queue',
	})
	public async stop(
		@Context() [interaction]: SlashCommandContext,
		@Options() { page }: RadioQueueOptions,
	) {
		return this._radio.queue(interaction, page ?? 1);
	}

	@Button('RADIO_QUEUE/:page')
	public async onIncreaseButton(
		@Context()
		[interaction]: ButtonContext,
		@ComponentParam('page') page: string | number,
	) {
		if (typeof page === 'string') {
			page = Number.parseInt(page, 10);
		}

		return this._radio.queue(interaction, page ?? 1);
	}
}
