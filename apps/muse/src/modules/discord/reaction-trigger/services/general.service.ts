import { Injectable, Logger } from '@nestjs/common';
import { Client, Message } from 'discord.js';

import { ReactionTriggerSettingsService } from './settings.service';

import { PrismaService } from '@prisma';

import { TriggerMatch } from '@prisma/client';

import { escapeRegExp, resolveEmoji } from '@util';

@Injectable()
export class ReactionTriggerGeneralService {
	private readonly _logger = new Logger(ReactionTriggerGeneralService.name);

	constructor(
		private _prisma: PrismaService,
		private _settings: ReactionTriggerSettingsService,
		private _client: Client
	) {}

	public async getReactionTriggers(guildId: string, page = 1) {
		const where = {
			guildId,
		};

		const triggers = await this._prisma.reactionTriggers.findMany({
			where,
		});

		const resolvedTriggers = triggers
			.map(trigger => {
				const { clientEmoji, unicode } = resolveEmoji(
					trigger.emojiId,
					this._client
				);

				return {
					...trigger,
					emoji: clientEmoji ?? (unicode ? trigger.emojiId : null),
				};
			})
			.filter(trigger => !!trigger.emoji);

		return {
			triggers: resolvedTriggers.slice(10 * (page - 1), 10 * page),
			total: resolvedTriggers.length,
		};
	}

	public addReactionTriggerByWord(
		guildId: string,
		phrase: string,
		match: TriggerMatch,
		emojiId: string
	) {
		return this._prisma.reactionTriggers.create({
			data: {
				guildId,
				phrase,
				match,
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
		if (ignoredChannelIds.includes(message.channelId)) {
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

		for (const { id, phrase, match, emojiId } of triggers) {
			let regexInstance: RegExp;
			let test = false;

			switch (match) {
				case 'word': {
					regexInstance = new RegExp(`\\b${escapeRegExp(phrase)}\\b`, 'gim');
					test = regexInstance.test(message.cleanContent);
					break;
				}
				case 'message': {
					test = phrase === message.cleanContent;
					break;
				}
				default: {
					regexInstance = new RegExp(escapeRegExp(phrase), 'gim');
					test = regexInstance.test(message.cleanContent);
					break;
				}
			}

			if (!test) {
				continue;
			}

			this._logger.debug(
				`Got a match for ${regexInstance} on ${message.guildId}, adding emote with id ${emojiId}`
			);
			await message.react(emojiId).catch(error => {
				if (error.message === 'Unknown Emoji') {
					return this._logger.warn(
						`Found a stray reaction trigger with id "${id}" for emoji ${emojiId}`
					);
				}

				throw error;
			});
		}
	}
}
