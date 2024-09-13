import { Injectable, Logger } from '@nestjs/common';
import { Events } from 'discord.js';
import { Context, ContextOf, On } from 'necord';

import { getUsername } from '@muse/util/get-username';

import { getInteractionCommandName } from '@util';
@Injectable()
export class InteractionEvents {
	private readonly _logger = new Logger(InteractionEvents.name);

	@On(Events.InteractionCreate)
	public onInteractionCreate(
		@Context() [interaction]: ContextOf<Events.InteractionCreate>
	) {
		const commandName = getInteractionCommandName(interaction);

		this._logger.log(
			`Interaction "${commandName}" (${
				interaction.constructor.name
			}) used by ${getUsername(interaction.user)}!`
		);
	}
}
