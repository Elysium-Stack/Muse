import { SettingsService } from '@muse/modules/settings';
import { getUsername } from '@muse/util/get-username';
import { Injectable, Logger } from '@nestjs/common';
import { MESSAGE_PREFIX, delay } from '@util';
import { isBefore, startOfDay, sub } from 'date-fns';
import { Client, Guild, TextChannel, User } from 'discord.js';

@Injectable()
export class AdminPurgeService {
	private readonly _logger = new Logger(AdminPurgeService.name);
	private _purgeListMap = new Map<string, string>();

	constructor(private _settings: SettingsService, private _client: Client) {}

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
		userToken: string,
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

		const inactiveMessages = await this._getLatestMessageOfInactiveMembers(
			members,
			guild,
			userToken,
			timestampXMonthsAgo,
		);

		if (!inactiveMessages.length) {
			this._purgeListMap.delete(guild.id);
			await channel.send({
				content: `**${MESSAGE_PREFIX} Purge list result**\nNo inactive members found in given timeframe of ${
					months === 1 ? 'a month' : `${months} months`
				}.\n<@${author.id}>`,
			});
			return false;
		}

		let result =
			`\n` +
			inactiveMessages
				.map(
					(m, index) =>
						`${index + 1}. <@${m.author.id}>: ${
							m.id === 'never'
								? 'Never sent a message'
								: `https://discord.com/channels/${guild.id}/${m.channel_id}/${m.id}`
						}`,
				)
				.join('\n');

		if (userIdsOnly) {
			result = `\`\`\`
${inactiveMessages.map((m) => m.author.id).join('\n')}
\`\`\``;
		}

		await channel.send({
			content: `**${MESSAGE_PREFIX} Purge list result**
Below you can find a list of all users that were inactive.
${result}
<@${author.id}>`,
		});

		this._purgeListMap.delete(guild.id);
		return true;
	}

	private async _getLatestMessageOfInactiveMembers(
		members,
		guild,
		userToken,
		timestampXMonthsAgo,
	) {
		const users = members.map((m) => m.user);
		const chunked = users.reduce((resultArray, item, index) => {
			const chunkIndex = Math.floor(index / 10);

			if (!resultArray[chunkIndex]) {
				resultArray[chunkIndex] = []; // start a new chunk
			}

			resultArray[chunkIndex].push(item);

			return resultArray;
		}, []);

		let messages = [];
		for (let chunk of chunked) {
			this._logger.log(
				`Starting on ${chunk.length}: ${chunk
					.map((c) => c.username)
					.join(', ')}`,
			);
			const promises = await Promise.allSettled(
				chunk.map(async (user, index) => {
					await delay(500 * index);
					const data = await this._getUserLastMessage(
						user,
						guild.id,
						userToken,
					);
					return data;
				}),
			);

			const chunkMessages = promises
				.filter((p) => p.status === 'fulfilled')
				.map((p: PromiseFulfilledResult<any>) => p.value)
				.filter(
					(m) =>
						!!m &&
						(m.id === 'never' ||
							(!m.author.bot &&
								isBefore(
									new Date(m.timestamp),
									new Date(timestampXMonthsAgo),
								))),
				);

			messages = messages.concat(chunkMessages);

			await delay(500);
		}

		return messages;
	}

	private async _getUserLastMessage(user, guildId, userToken, retry = 0) {
		const data = await fetch(
			`https://discord.com/api/guilds/${guildId}/messages/search?author_id=${user.id}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: userToken,
				},
			},
		).catch(async (err) => {
			if (retry === 4) {
				throw err;
			}

			await delay(1000);
			return this._getUserLastMessage(
				user,
				guildId,
				userToken,
				retry + 1,
			);
		});

		if (data.status === 429) {
			const delayMs = parseInt(data.headers.get('retry-after'), 10) * 10;
			this._logger.warn(
				`Received a rate limit for ${getUsername(
					user,
				)}, retrying after ${delayMs}ms`,
			);
			await delay(delayMs);
			return this._getUserLastMessage(
				user,
				guildId,
				userToken,
				retry + 1,
			);
		}

		if (!data) {
			return false;
		}

		const body = await data.json();

		if (!body.messages.length) {
			return {
				id: 'never',
				author: user,
			};
		}

		return body.messages.map((m) => m?.[0])?.[0];
	}
}
