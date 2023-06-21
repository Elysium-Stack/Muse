import { Injectable } from '@nestjs/common';
import { Client, EmbedBuilder, TextChannel } from 'discord.js';

@Injectable()
export class DeveloperLogService {
	constructor(private _client: Client) {}

	async sendError(
		data: any,
		message: string,
		source: string,
		guildId?: string,
	) {
		const embed = new EmbedBuilder()
			.setTitle('Error')
			.setDescription(message)
			.addFields(
				{
					name: 'Source',
					value: source,
				},
				...(guildId
					? [
							{
								name: 'Guild ID',
								value: guildId,
							},
					  ]
					: []),
			);

		const errorEmbed = new EmbedBuilder()
			.setTitle('Data')
			.setDescription(`\`\`\`\n${JSON.stringify(data, null, 2)}\n\`\`\``);

		const guild = await this._client.guilds.fetch(
			process.env.DEVELOPMENT_SERVER_IDS,
		);
		if (!guild) {
			throw new Error('Could not find development server');
		}

		const channel = await guild.channels.fetch(
			process.env.DEVELOPMENT_LOG_CHANNEL_ID,
		);
		if (!channel) {
			throw new Error('Could not find development log channel');
		}

		if (!(channel instanceof TextChannel)) {
			throw new Error('Development log channel is not a text channel');
		}

		await channel.send({ embeds: [embed, errorEmbed] });
	}
}
