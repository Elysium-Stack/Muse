import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { startOfMinute } from 'date-fns';
import { ChannelType, Client } from 'discord.js';

import { createPromptEmbed } from '../util/create-question-embed';

import { PrismaService } from '@prisma';

import { MESSAGE_PREFIX } from '@util';
@Injectable()
export class WriterPromptGeneralService {
	private readonly _logger = new Logger(WriterPromptGeneralService.name);

	public questions = [];

	constructor(
		private _prisma: PrismaService,
		private _client: Client
	) {}

	create(guildId: string, prompt: string, scheduleDate: Date) {
		return this._prisma.writePrompt.create({
			data: {
				guildId,
				prompt,
				scheduleDate,
			},
		});
	}

	@Cron('0 * * * * *')
	async checkDaily() {
		this._logger.log('Checking for writer prompt daily question.');

		const currentTime = startOfMinute(new Date());
		const prompts = await this._prisma.writePrompt.findMany({
			where: {
				scheduleDate: currentTime,
			},
		});

		for (const { guildId, prompt } of prompts) {
			const {
				writerPromptChannelId,
				writerPromptEnabled,
				writerPromptPingRoleId,
			} = await this._prisma.settings.findFirst({
				where: {
					guildId,
				},
			});

			if (!writerPromptEnabled || !writerPromptChannelId) {
				continue;
			}

			const guild = await this._client.guilds.fetch(guildId);
			const channel = await guild.channels.fetch(writerPromptChannelId);

			if (channel?.type === ChannelType.GuildText) {
				const embed = createPromptEmbed(
					`${MESSAGE_PREFIX} Writer prompt`,
					prompt,
					this._client.user
				);
				const content = writerPromptPingRoleId
					? `<@&${writerPromptPingRoleId}>`
					: '';
				await channel.send({ embeds: [embed], content });
			}
		}
	}
}
