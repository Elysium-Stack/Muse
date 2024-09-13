import { Injectable, Logger } from '@nestjs/common';
import { Message } from 'discord.js';

import { MessageTriggerSettingsService } from './settings.service';

import { PrismaService } from '@prisma';

import { TriggerMatch } from '@prisma/client';

import { escapeRegExp } from '@util';

@Injectable()
export class MessageTriggerGeneralService {
	private readonly _logger = new Logger(MessageTriggerGeneralService.name);

	constructor(
		private _prisma: PrismaService,
		private _settings: MessageTriggerSettingsService
	) {}

	public async getMessageTriggers(guildId: string, page = 1) {
		const where = {
			guildId,
		};

		const triggers = await this._prisma.messageTriggers.findMany({
			where,
		});

		return {
			triggers: triggers.slice(10 * (page - 1), 10 * page),
			total: triggers.length,
		};
	}

	public async getMessageTriggerById(guildId: string, id: number) {
		return this._prisma.messageTriggers.findFirst({
			where: {
				id,
				guildId,
			},
		});
	}

	public addMessageTriggerByWord(
		guildId: string,
		phrase: string,
		match: TriggerMatch,
		message: string
	) {
		return this._prisma.messageTriggers.create({
			data: {
				guildId,
				phrase,
				match,
				message,
			},
		});
	}

	public async removeMessageTriggerByID(guildId: string, id: number) {
		const trigger = await this._prisma.messageTriggers.findFirst({
			where: {
				guildId,
				id,
			},
		});

		if (!trigger) {
			return null;
		}

		await this._prisma.messageTriggers.delete({
			where: {
				id: trigger.id,
			},
		});

		return trigger;
	}

	public async checkForMessageTriggers(message: Message) {
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

		const triggersCount = await this._prisma.messageTriggers.count({
			where,
		});

		if (!triggersCount) {
			return;
		}

		const triggers = await this._prisma.messageTriggers.findMany({
			where,
		});

		for (const { phrase, match, message: msg } of triggers) {
			let regexInstance: RegExp;
			let test = false;

			switch (match) {
				case 'word': {
					regexInstance = new RegExp(
						`\\b${escapeRegExp(phrase)}\\b`,
						'gim'
					);
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
				`Got a match for ${regexInstance} on ${message.guildId}, replying with message:\n"${msg}"`
			);
			message.channel.send(msg);
		}
	}
}
