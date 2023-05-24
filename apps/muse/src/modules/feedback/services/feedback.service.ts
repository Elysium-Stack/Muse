import { PrismaService } from '@muse/modules/prisma';
import { MESSAGE_PREFIX } from '@muse/util/constants';
import { Injectable, Logger } from '@nestjs/common';
import { FeedbackTopics, FeedbackTopicsType } from '@prisma/client';
import { Client, EmbedBuilder, User } from 'discord.js';
import { FEEDBACK_EMBED_COLOR } from '../util/constants';

@Injectable()
export class FeedbackService {
	private readonly _logger = new Logger(FeedbackService.name);

	constructor(private _prisma: PrismaService, private _client: Client) {}

	public getTopicById(guildId: string, id: number) {
		return this._prisma.feedbackTopics.findFirst({
			where: {
				id,
				guildId,
			},
		});
	}

	public getAllTopics(guildId: string) {
		return this._prisma.feedbackTopics.findMany({
			where: {
				guildId,
			},
		});
	}

	public async getTopicsPerPage(guildId: string, page = 1) {
		const where = {
			guildId,
		};

		const total = await this._prisma.feedbackTopics.count({
			where,
		});

		const topics = await this._prisma.feedbackTopics.findMany({
			where,
			skip: 10 * (page - 1),
			take: 10,
		});

		return {
			topics,
			total,
		};
	}

	public addFeedbackTopicByName(
		guildId: string,
		name: string,
		type: FeedbackTopicsType,
		referenceId: string,
	) {
		return this._prisma.feedbackTopics.create({
			data: {
				guildId,
				name,
				type,
				referenceId,
			},
		});
	}

	public async removeFeedbackTopicById(guildId: string, id: number) {
		const trigger = await this._prisma.feedbackTopics.findFirst({
			where: {
				guildId,
				id,
			},
		});

		if (!trigger) {
			return null;
		}

		await this._prisma.feedbackTopics.delete({
			where: {
				id: trigger.id,
			},
		});

		return trigger;
	}

	public async processFeedback(
		topicId: string,
		guildId: string,
		user: User,
		content: string,
	) {
		const topic = await this.getTopicById(guildId, parseInt(topicId, 10));

		if (topic.type === 'CHANNEL') {
			return this._processChannelFeedback(topic, guildId, user, content);
		}

		return this._processGoogleSheetFeedback(topic, guildId, user, content);
	}

	private async _processChannelFeedback(
		topic: FeedbackTopics,
		guildId: string,
		user: User,
		content: string,
	) {
		const embed = new EmbedBuilder()
			.setTitle(`${MESSAGE_PREFIX} Feedback response`)
			.addFields(
				{
					name: 'Topic',
					value: topic.name,
					inline: true,
				},
				{
					name: 'Feedback by',
					value: `<@${user.id}>`,
					inline: true,
				},
				{
					name: 'Feedback',
					value: content,
				},
			)
			.setColor(FEEDBACK_EMBED_COLOR);

		const guild = await this._client.guilds.fetch(guildId);
		const channel = await guild.channels.fetch(topic.referenceId);

		if (!channel || !channel.isTextBased()) {
			return;
		}

		await channel.send({
			embeds: [embed],
		});
	}

	private async _processGoogleSheetFeedback(
		topic: FeedbackTopics,
		guildId: string,
		user: User,
		content: string,
	) {
		this._logger.warn(
			`Google sheet feedback is not implemented yet ${topic.name} ${guildId} ${user.id} ${content}`,
		);
	}
}
