import { Injectable, Logger } from '@nestjs/common';
import { Message } from 'discord.js';
import { default as Rcon } from 'rcon-ts';

import { stringToUuid } from '../util/string-to-uuid';

import { MinecraftSettingsService } from './settings.service';

import { PrismaService } from '@prisma';

@Injectable()
export class MinecraftGeneralService {
	private readonly _logger = new Logger(MinecraftGeneralService.name);

	private _uuidUrl = 'https://api.mojang.com/users/profiles/minecraft';
	private _xuidUrl = 'https://xbl-web-api.int-max.eu.org/xuid/{username}/raw';

	constructor(
		private _prisma: PrismaService,
		private _settings: MinecraftSettingsService
	) {}

	async fetchUserData(
		username,
		bedrock = false
	): Promise<null | { id: string; uuid: string; name: string }> {
		let data = bedrock
			? this._getBedrockData(username)
			: this._getJavaData(username);

		data = await data;
		return data;
	}

	async register(guildId, userId, uuid, username, bedrock = false) {
		const response = await this._sendRcon(
			guildId,
			`vcl add ${username.replaceAll(' ', '')}`
		);
		await this._saveInDB(guildId, userId, uuid, username, bedrock);
		return response;
	}

	async removeAll(guildId, userId) {
		const items = await this._prisma.minecraftMapping.findMany({
			where: {
				guildId,
				userId,
			},
		});

		if (!items?.length) {
			return;
		}

		for (const item of items) {
			await this._sendRcon(
				guildId,
				`vcl remove ${item.username.replaceAll(' ', '')}`
			);
			await this._prisma.minecraftMapping.delete({
				where: {
					id: item.id,
				},
			});
			this._logger.log(`Removed minecraft mapping for ${item.username}`);
		}
	}

	async sendMessage(message: Message) {
		const settings = await this._settings.get(message.guildId);
		const { chatChannelId } = settings;

		if (message.webhookId) {
			return;
		}

		if (message.author.bot) {
			return;
		}

		if (!chatChannelId) {
			return;
		}

		if (chatChannelId !== message.channelId) {
			return;
		}

		const member = await message.guild.members.fetch(message.author.id);
		if (!member) {
			return;
		}

		if (!message.cleanContent?.length) {
			return;
		}

		this._logger.log(
			`Sending message for ${member.displayName} ${member.displayHexColor}`
		);

		const mcMessage = `&${member.displayHexColor}& ${
			member.nickname ?? member.displayName
		}&f: ${message.cleanContent}`;
		return this._sendRcon(message.guildId, `discord ${mcMessage}`);
	}

	private _getJavaData(username: string) {
		return fetch(`${this._uuidUrl}/${username}`)
			.then(res => res.json())
			.then(res =>
				res?.id ? { ...res, uuid: stringToUuid(res.id) } : null
			)
			.catch(() => null);
	}

	private _getBedrockData(username: string) {
		return fetch(
			this._xuidUrl.replace('{username}', username.replaceAll(' ', ''))
		)
			.then(res => res.json())
			.then(res => ({
				id: res.code === 404 ? null : res.xuid,
				name: username,
				uuid: res.xuid ? stringToUuid(`00000000${res.xuid}`) : null,
			}))
			.catch(() => null);
	}

	private async _saveInDB(guildId, userId, uuid, username, bedrock) {
		const item = await this._prisma.minecraftMapping.findFirst({
			where: {
				guildId,
				uuid,
				userId,
				bedrock,
			},
		});

		if (!item) {
			return this._prisma.minecraftMapping.create({
				data: {
					guildId,
					username,
					userId,
					uuid,
					bedrock,
				},
			});
		}

		return this._prisma.minecraftMapping.update({
			where: {
				id: item.id,
			},
			data: {
				username,
				userId,
				bedrock,
			},
		});
	}

	private async _sendRcon(guildId, command: string) {
		const { rconHost, rconPort, rconPass } =
			await this._settings.get(guildId);

		const client = new Rcon({
			host: rconHost,
			port: Number.parseInt(rconPort, 10),
			password: rconPass,
			timeout: 2000,
		});

		try {
			this._logger.log(`Sending rcon command "${command}"`);
			const response = await client.session(async c => c.send(command));
			return response;
		} catch (error) {
			this._logger.error(error);
			return null;
		}
	}
}
