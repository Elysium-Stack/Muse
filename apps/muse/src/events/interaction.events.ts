import { Injectable, Logger } from '@nestjs/common';
import { getInteractionCommandName } from '@util';
import { Events } from 'discord.js';
import { Context, ContextOf, On } from 'necord';
@Injectable()
export class InteractionEvents {
	private readonly _logger = new Logger(InteractionEvents.name);

	@On(Events.InteractionCreate)
	public onInteractionCreate(
		@Context() [interaction]: ContextOf<Events.InteractionCreate>,
	) {
		const commandName = getInteractionCommandName(interaction);

		this._logger.log(
			`Interaction "${commandName}" (${interaction.constructor.name}) used by ${interaction.user.username}:${interaction.user.discriminator}!`,
		);
	}
}
