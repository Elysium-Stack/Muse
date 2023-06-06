import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@prisma';
import { escapeRegExp } from '@util';
import { Client, Message } from 'discord.js';
import { ReactionTriggerSettingsService } from './settings.service';
@Injectable()
export class ReactionTriggerGeneralService {
	private readonly _logger = new Logger(ReactionTriggerGeneralService.name);

	constructor(
		private _prisma: PrismaService,
		private _settings: ReactionTriggerSettingsService,
		private _client: Client,
	) {}

	public async getReactionTriggers(guildId: string, page = 1) {
		const where = {
			guildId,
		};

		const triggers = await this._prisma.reactionTriggers.findMany({
			where,
		});

		const resolvedTriggers = triggers
			.map((trigger) => {
				const resolvedEmoji = this._client.emojis.resolve(
					trigger.emojiId,
				);

				return {
					...trigger,
					emoji: resolvedEmoji,
				};
			})
			.filter((trigger) => !!trigger.emoji);

		return {
			triggers: resolvedTriggers.slice(10 * (page - 1), 10 * page),
			total: resolvedTriggers.length,
		};
	}

	public addReactionTriggerByWord(
		guildId: string,
		phrase: string,
		exact: boolean,
		emojiId: string,
	) {
		return this._prisma.reactionTriggers.create({
			data: {
				guildId,
				phrase,
				exact,
				emojiId,
			},
		});
	}

	public async removeReactionTriggerByID(guildId: string, id: number) {
		const trigger = await this._prisma.reactionTriggers.findFirst({
			where: {
				guildId,
				id,
			},
		});

		if (!trigger) {
			return null;
		}

		await this._prisma.reactionTriggers.delete({
			where: {
				id: trigger.id,
			},
		});

		return trigger;
	}

	public async checkForReactionTriggers(message: Message) {
		if (!message.inGuild() || message.author.bot) {
			return;
		}

		const settings = await this._settings.get(message.guildId);
		if (!settings?.enabled) {
			return;
		}

		const { ignoredChannelIds } = settings;
		if (ignoredChannelIds.indexOf(message.channelId) >= 0) {
			return;
		}

		const where = {
			guildId: message.guildId,
		};

		const triggersCount = await this._prisma.reactionTriggers.count({
			where,
		});

		if (!triggersCount) {
			return;
		}

		const triggers = await this._prisma.reactionTriggers.findMany({
			where,
		});

		for (const { id, phrase, exact, emojiId } of triggers) {
			const regexInstance = new RegExp(escapeRegExp(phrase), 'ig');
			const test = exact
				? phrase === message.content
				: regexInstance.test(message.content);

			if (!test) {
				continue;
			}

			this._logger.debug(
				`Got a match for ${regexInstance} on ${message.guildId}, adding emote with id ${emojiId}`,
			);
			await message.react(emojiId).catch((err) => {
				if (err.message === 'Unknown Emoji') {
					return this._logger.warn(
						`Found a stray reaction trigger with id "${id}" for emoji ${emojiId}`,
					);
				}

				throw err;
			});
		}
	}
}
