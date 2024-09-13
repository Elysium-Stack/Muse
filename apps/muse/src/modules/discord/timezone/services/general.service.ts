import { Injectable, Logger } from '@nestjs/common';
import enUS, { isValid } from 'date-fns';
import { formatInTimeZone, utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { EmbedBuilder, Message } from 'discord.js';

import { getUsername } from '@muse/util/get-username';

import { PrismaService } from '@prisma';

@Injectable()
export class TimezoneGeneralService {
	private readonly _logger = new Logger(TimezoneGeneralService.name);

	constructor(private _prisma: PrismaService) {}

	async setTimezone(guildId: string, userId: string, timezone: string) {
		const data = await this.getTimezone(guildId, userId);
		if (data) {
			return this._prisma.timezoneData.update({
				where: {
					id: data.id,
				},
				data: {
					timezone,
				},
			});
		}

		return this._prisma.timezoneData.create({
			data: { guildId, userId, timezone },
		});
	}

	getTimezone(guildId: string, userId: string) {
		return this._prisma.timezoneData.findFirst({
			where: {
				guildId,
				userId,
			},
		});
	}

	async checkTimezonedMessage(message: Message, hour: number, minutes: number) {
		const data = await this.getTimezone(message.guildId, message.author.id);
		if (!data) {
			return;
		}

		const date = utcToZonedTime(new Date(), data.timezone);
		date.setHours(hour);
		date.setMinutes(minutes);

		if (!isValid(date)) {
			return;
		}

		const utcDate = zonedTimeToUtc(date, data.timezone);

		if (!isValid(utcDate)) {
			return;
		}

		const embed = new EmbedBuilder().addFields(
			{
				name: `${getUsername(message.author)}'s time`,
				value: formatInTimeZone(utcDate, data.timezone, 'HH:mm zzz', {
					locale: enUS,
				}),
				inline: true,
			},
			{
				name: `Your time`,
				value: `<t:${Math.round(utcDate.getTime() / 1000)}:t>`,
				inline: true,
			}
		);

		// .setDescription(
		// 	`**${getUsername(message.author)}'s time:** ${formatInTimeZone(
		// 		utcDate,
		// 		data.timezone,
		// 		'HH:mm zzz',
		// 		{ locale: enUS },
		// 	)}
		// **Your time:**: <t:${utcDate.getTime()}:t>`,
		// )

		return message.channel.send({
			embeds: [embed],
		});
	}
}
