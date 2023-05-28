import {
	BaseMessageOptions,
	CommandInteraction,
	MessageComponentInteraction,
} from 'discord.js';

export const interactionReply = async (
	interaction: CommandInteraction | MessageComponentInteraction | null,
	data: BaseMessageOptions,
	ephemeral = true,
) => {
	if (!interaction) {
		return;
	}

	if (interaction.deferred) {
		return interaction.editReply(data);
	}

	if (interaction.replied) {
		return interaction.followUp({ ...data, ephemeral });
	}

	return interaction.reply({ ...data, ephemeral });
};
