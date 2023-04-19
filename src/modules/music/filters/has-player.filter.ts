import { interactionReply } from '@muse/util/interaction-replies';
import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { SlashCommandContext } from 'necord';
import { HasNoPlayerException } from '../util/errors';

@Catch(HasNoPlayerException)
export class HasNoPlayerExceptionFilter implements ExceptionFilter {
	private readonly _logger = new Logger(HasNoPlayerExceptionFilter.name);

	async catch(exception: Error, host: ArgumentsHost) {
		const [interaction] = host.getArgByIndex<SlashCommandContext>(0) ?? [
			undefined,
		];
		const message = {
			content: 'I am not currently playing anything here!',
		};
		this._logger.error(exception);

		return interactionReply(interaction, message);
	}
}
