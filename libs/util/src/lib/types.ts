import {
	CommandInteraction,
	InteractionResponse,
	MessageComponentInteraction,
} from 'discord.js';

export type promptFunction = (
	interaction: MessageComponentInteraction | CommandInteraction,
	isFollowUp?: boolean,
	message?: string,
) => Promise<InteractionResponse<boolean>>;
