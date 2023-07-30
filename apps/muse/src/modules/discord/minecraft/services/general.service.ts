import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@prisma';
import { Message } from 'discord.js';
import Rcon from 'rcon-ts';
import { stringToUuid } from '../util/string-to-uuid';
import { MinecraftSettingsService } from './settings.service';

@Injectable()
export class MinecraftGeneralService {
	private readonly _logger = new Logger(MinecraftGeneralService.name);

	private _uuidUrl = 'https://api.mojang.com/users/profiles/minecraft';

	constructor(
		private _prisma: PrismaService,
		private _settings: MinecraftSettingsService,
	) {}

	async fetchUserData(
		username,
	): Promise<null | { id: string; uuid: string; name: string }> {
		let data = fetch(`${this._uuidUrl}/${username}`)
			.then((res) => res.json())
			.then((res) =>
				res?.id ? { ...res, uuid: stringToUuid(res.id) } : null,
			)
			.catch(() => null);

		data = await data;
		this._logger.log(
			`Received data for ${username}: ${JSON.stringify(data)}`,
		);
		return data;
	}

	async register(guildId, userId, uuid, username) {
		const response = await this._sendRcon(`whitelist add ${uuid}`);
		await this._saveInDB(guildId, userId, uuid, username);
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
			await this._sendRcon(`whitelist remove ${item.uuid}`);
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

		console.log(chatChannelId);
		if (!chatChannelId) {
			return;
		}

		console.log(chatChannelId, message.channelId);
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
			`Sending message for ${member.displayName} ${member.displayHexColor}`,
		);

		const mcMessage = `&${member.displayHexColor}& ${
			member.nickname ?? member.displayName
		}&f: ${message.cleanContent}`;
		return this._sendRcon(`discord ${mcMessage}`);
	}

	private async _saveInDB(guildId, userId, uuid, username) {
		const item = await this._prisma.minecraftMapping.findFirst({
			where: {
				guildId,
				uuid,
				userId,
			},
		});

		if (!item) {
			return this._prisma.minecraftMapping.create({
				data: {
					guildId,
					username,
					userId,
					uuid,
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
			},
		});
	}

	private async _sendRcon(command: string) {
		const client = new Rcon({
			host: process.env.MC_RCON_HOST,
			port: parseInt(process.env.MC_RCON_PORT, 10),
			password: process.env.MC_RCON_PASS,
			timeout: 1000,
		});

		try {
			this._logger.log(`Sending rcon command "${command}"`);
			const response = await client.session((c) => c.send(command));
			return response;
		} catch (e) {
			this._logger.error(e);
			return null;
		}
	}
}
