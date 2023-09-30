import {
	MusicCommandDecorator,
	MusicInVoiceGuard,
	NotInVoiceExceptionFilter,
} from '@music';
import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import { EnabledExceptionFilter } from '@util';
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
import { MusicEnabledGuard } from '../guards/enabled.guard';
import { MusicService } from '../services';

class MusicQueueOptions {
	@NumberOption({
		name: 'page',
		description: 'The page of the queue you want to view',
		min_value: 0,
		max_value: 100,
	})
	page: number | undefined;
}

@UseGuards(MusicEnabledGuard, MusicInVoiceGuard)
@UseFilters(EnabledExceptionFilter, NotInVoiceExceptionFilter)
@MusicCommandDecorator()
export class MusicQueueCommands {
	private readonly _logger = new Logger(MusicQueueCommands.name);

	constructor(private _music: MusicService) {}

	@Subcommand({
		name: 'queue',
		description: 'Get the current queue',
	})
	public async stop(
		@Context() [interaction]: SlashCommandContext,
		@Options() { page }: MusicQueueOptions,
	) {
		return this._music.queue(interaction, page ?? 1);
	}

	@Button('MUSIC_QUEUE/:page')
	public async onIncreaseButton(
		@Context()
		[interaction]: ButtonContext,
		@ComponentParam('page') page: string | number,
	) {
		if (typeof page === 'string') {
			page = parseInt(page, 10);
		}

		return this._music.queue(interaction, page ?? 1);
	}
}
