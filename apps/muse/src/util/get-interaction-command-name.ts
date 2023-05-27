import { CacheType, Interaction } from 'discord.js';

export const getInteractionCommandName = (
	interaction: Interaction<CacheType>,
	delimeter = ' ',
) => {
	if (
		!interaction.isChatInputCommand() &&
		!interaction.isMessageContextMenuCommand() &&
		!interaction.isUserContextMenuCommand()
	) {
		return (interaction as any)['customId'];
	}

	const { _group, _subcommand } = interaction.options as any;

	const commandNames = [interaction.commandName];
	if (_group) {
		commandNames.push(_group);
	}
	if (_subcommand) {
		commandNames.push(_subcommand);
	}

	return commandNames.join(delimeter);
};
