import { SettingsService } from '@muse/modules/settings';
import { getUsername } from '@muse/util/get-username';
import { Injectable, Logger } from '@nestjs/common';
import { MESSAGE_PREFIX, chunks, delay } from '@util';
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

		await channel.send({
			content: `**${MESSAGE_PREFIX} Purge list result (${inactiveMessages.length} total)**
Below you can find a list of all users that were inactive.`,
		});

		if (userIdsOnly) {
			const chunked = [...chunks(inactiveMessages, 100)];
			for (let i = 0; i < chunked.length; i++) {
				const chunk = chunked[i];
				await channel.send({
					content: `\`\`\`
				${chunk.map((m) => m.author.id).join(',')}
				\`\`\``,
				});
			}
		} else {
			const chunked = [...chunks(inactiveMessages, 10)];
			for (let i = 0; i < chunked.length; i++) {
				const chunk = chunked[i];
				const baseIndex = i * 10 + 1;

				await channel.send({
					content: chunk
						.map(
							(m, index) =>
								`${baseIndex + index}. <@${m.author.id}>: ${
									m.id === 'never'
										? 'Never sent a message'
										: `https://discord.com/channels/${guild.id}/${m.channel_id}/${m.id}`
								}`,
						)
						.join('\n'),
				});
			}
		}

		await channel.send({
			content: `<@${author.id}>`,
		});

		this._purgeListMap.delete(guild.id);
		return true;
	}

	async kickMembers(
		guild: Guild,
		ids: string[],
		reason: string,
		message?: string,
	) {
		const promises = await Promise.allSettled(
			ids.map(async (id) => this._client.users.fetch(id)),
		);
		const users = promises
			.filter((p) => p.status === 'fulfilled')
			.map((p: PromiseFulfilledResult<User>) => p.value)
			.filter((u) => !!u);

		let count = 0;
		for (let user of users) {
			let response = true;
			const guildMember = await guild.members.fetch({
				user,
			});

			if (!guildMember) {
				continue;
			}

			if (message) {
				const dm = await user.createDM(true);
				await dm
					.send({
						content: message.replace(
							/{username}/gi,
							getUsername(user),
						),
					})
					.catch(() => (response = false));
			}

			if (!response) {
				this._logger.warn(
					`Failed to send message for user ${getUsername(user)}`,
				);
			}

			const kicked = await guildMember
				.kick(reason)
				.catch(() => (response = false));

			if (!kicked) {
				this._logger.warn(`Failed to kick member ${getUsername(user)}`);
			}

			count++;
		}

		return count;
	}

	private async _getLatestMessageOfInactiveMembers(
		members,
		guild,
		userToken,
		timestampXMonthsAgo,
	) {
		const users = members.map((m) => m.user);
		const chunked = [...chunks(users, 10)];

		let messages = [];
		for (let chunk of chunked) {
			this._logger.log(
				`Starting on ${chunk.length}: ${chunk
					.map((c) => c.username)
					.join(', ')}`,
			);
			const promises = await Promise.allSettled(
				chunk.map(async (user, index) => {
					await delay(1500 * index);
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

			this._logger.log(
				`Found ${chunkMessages.length} in chunk, delaying for 5000ms.`,
			);
			await delay(5000);
		}

		this._logger.log(`Found ${messages.length} messages total`);
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
			if (retry === 4) {
				this._logger.warn(
					`Skipping ${getUsername(
						user,
					)} because of retries & rate limit.`,
				);
				return false;
			}

			const delayMs =
				parseInt(data.headers.get('retry-after'), 10) * 10 + 1000;
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
