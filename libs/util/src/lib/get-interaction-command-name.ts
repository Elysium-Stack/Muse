import { CacheType, Interaction } from 'discord.js';

export const getInteractionCommandName = (
	interaction: Interaction<CacheType>,
	delimeter = ' '
) => {
	if (
		!interaction.isChatInputCommand() &&
		!interaction.isMessageContextMenuCommand() &&
		!interaction.isUserContextMenuCommand()
	) {
		return interaction['customId'];
	}

	const _group = interaction.options['_group'];
	const _subcommand = interaction.options['_subcommand'];

	const commandNames = [interaction.commandName];
	if (_group) {
		commandNames.push(_group);
	}
	if (_subcommand) {
		commandNames.push(_subcommand);
	}

	return commandNames.join(delimeter);
};
