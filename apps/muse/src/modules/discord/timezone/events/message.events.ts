import { Injectable, Logger } from '@nestjs/common';
import { Events } from 'discord.js';
import { Context, ContextOf, On } from 'necord';

import { TimezoneSettingsService } from '../services';
import { TimezoneGeneralService } from '../services/general.service';

@Injectable()
export class TimezoneMessageEvents {
	private readonly _logger = new Logger(TimezoneMessageEvents.name);

	constructor(
		private _timezone: TimezoneGeneralService,
		private _settings: TimezoneSettingsService
	) {}

	@On(Events.MessageCreate)
	public async onMessageCreate(
		@Context() [message]: ContextOf<Events.MessageCreate>
	) {
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

		const hourRegex = /(?:\W|^)(\d{1,2})\s*(a\.m\.|p\.m\.|am|pm)(?:\W|$)/gim;
		const hourMinuteRegex =
			/(?:\W|^)((?:[01]{0,1}\d)|(?:2[0-3]))[.:：]((?:[0-5]\d))(?:\s*(a\.m\.|p\.m\.|am|pm))?(?:\W|$)/gim;

		const hourMinuteMatch = hourMinuteRegex.exec(message.cleanContent);

		let hour = 0;
		let minutes = 0;
		let timeIndication = null;

		if (hourMinuteMatch?.length) {
			const [_, matchedHour, matchedMinutes, matchedTimeindication] =
				hourMinuteMatch;
			hour = Number.parseInt(matchedHour);
			minutes = Number.parseInt(matchedMinutes);
			timeIndication = matchedTimeindication?.toLowerCase();
		}

		const hourMatch = hourRegex.exec(message.cleanContent);
		if (!hourMinuteMatch?.length && hourMatch?.length) {
			const [_, matchedHour, matchedTimeindication] = hourMatch;
			hour = Number.parseInt(matchedHour);
			timeIndication = matchedTimeindication?.toLowerCase();
		}

		if (isNaN(hour) || isNaN(minutes)) {
			return;
		}

		if (minutes > 59) {
			return;
		}

		if (hour > 23) {
			return;
		}

		if (timeIndication === 'am' && hour === 12) {
			hour = 0;
		}

		if (timeIndication === 'pm' && hour < 12) {
			hour += 12; // add 12
		}

		if (hour || minutes || timeIndication) {
			return this._timezone.checkTimezonedMessage(message, hour, minutes);
		}
	}
}
