import { SettingsService } from '@muse/modules/settings';
import { getUsername } from '@muse/util/get-username';
import { Injectable, Logger } from '@nestjs/common';
import { MESSAGE_PREFIX } from '@util';
import { startOfDay, sub } from 'date-fns';
import {
	ChannelType,
	Collection,
	Guild,
	Message,
	TextChannel,
	User,
} from 'discord.js';

@Injectable()
export class AdminPurgeService {
	private readonly _logger = new Logger(AdminPurgeService.name);
	private _purgeListMap = new Map<string, string>();

	constructor(private _settings: SettingsService) {}

	clearMap() {
		this._purgeListMap.clear();
	}

	checkGuild(guildId) {
		return !!this._purgeListMap.get(guildId);
	}

	async createList(
		author: User,
		guild: Guild,
		channel: TextChannel,
		months = 6,
		userIdsOnly = false,
	) {
		if (this._purgeListMap.get(guild.id)) {
			return false;
		}

		this._purgeListMap.set(guild.id, channel.id);

		const timestampXMonthsAgo = startOfDay(
			sub(new Date(), {
				months,
			}),
		).getTime();

		let members = await guild.members.fetch();
		members = members.filter(
			(m) => !m.user.bot && m.joinedTimestamp < timestampXMonthsAgo,
		);

		if (!members.size) {
			this._purgeListMap.delete(guild.id);
			await channel.send({
				content: `**${MESSAGE_PREFIX} Purge list result**\nNo inactive members found that joined earlier than ${
					months === 1 ? 'a month' : `${months} months`
				} ago.\n<@${author.id}>`,
			});
			return false;
		}

		const memberids = members.map((m) => m.user.id);
		const messages = await this._collectMessages(
			guild,
			timestampXMonthsAgo,
			memberids,
		);

		const filteredMessages = messages.filter((m) =>
			memberids.includes(m.author.id),
		);
		const memberIdsThatTalked = filteredMessages
			.reduce((memberIds: string[], message: Message) => {
				if (!memberIds.includes(message.author.id)) {
					memberIds.push(message.author.id);
				}

				return memberIds;
			}, [])
			.filter((id) => !!id);

		const membersThatWereInactive = members.filter(
			(m) => !memberIdsThatTalked.includes(m.user.id),
		);

		const memberUserids = membersThatWereInactive.map((m) =>
			userIdsOnly ? m.user.id : `${getUsername(m.user)} - ${m.user.id}`,
		);
		await channel.send({
			content: `**${MESSAGE_PREFIX} Purge list result**
Below you can find a list of all users that were inactive.
\`\`\`
${memberUserids.join('\n')}
\`\`\`
<@${author.id}>`,
		});

		this._purgeListMap.delete(guild.id);
		return true;
	}

	private async _collectMessages(
		guild: Guild,
		timestamp: number,
		memberids: string[],
	) {
		const channels = await guild.channels.fetch();
		let messages = new Collection<string, Message>();

		const textChannels = channels.filter(
			(c) => c.type === ChannelType.GuildText,
		);

		console.log('channels:', textChannels.size);
		console.log('Member ids:', memberids);

		const settings = await this._settings.getSettings(guild.id, false);
		const ignoredParents = settings.purgeIgnoredParentChannelIds;

		for (let channel of textChannels.values()) {
			if (ignoredParents.includes(channel.parentId)) {
				console.log(
					`Ignoring ${channel.name} because it's category is ${channel.parent.name}`,
				);
				continue;
			}

			console.log(`Starting on ${channel.name}`);
			const channelMessages = await this._fetchMessagesUntil(
				channel as TextChannel,
				timestamp,
			);

			messages = messages.concat(channelMessages);
		}

		console.log(`Returning a total of ${messages.size} messages`);
		return messages;
	}

	private async _fetchMessagesUntil(
		channel: TextChannel,
		timestamp: number,
		lastID?: string,
	): Promise<Collection<string, Message<true>>> {
		let messages = await channel.messages.fetch({
			limit: 100,
			before: lastID,
		});

		messages = messages.filter((m) => m.createdTimestamp >= timestamp);
		if (messages.size == 0) return messages;

		return messages.concat(
			await this._fetchMessagesUntil(
				channel,
				timestamp,
				messages.last().id,
			),
		);
	}
}
