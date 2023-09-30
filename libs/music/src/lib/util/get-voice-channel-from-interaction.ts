import { CommandInteraction, MessageComponentInteraction } from 'discord.js';

export const getVoiceChannelFromInteraction = async (
	interaction: CommandInteraction | MessageComponentInteraction,
) => {
	const member = await interaction.guild!.members.fetch(interaction.user.id);
	const { channel } = member.voice;

	if (!channel) {
		const content = `You must be in a voice channel to play music!`;

		if (interaction instanceof MessageComponentInteraction) {
			interaction.update({
				content,
			});
			return;
		}

		interaction.editReply({
			content,
		});
		return;
	}

	return channel;
};
