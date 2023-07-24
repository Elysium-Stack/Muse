import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@prisma';
import { Client } from 'discord.js';
import Rcon from 'rcon-ts';
import { stringToUuid } from '../util/string-to-uuid';

@Injectable()
export class MinecraftRegisterService {
	private readonly _logger = new Logger(MinecraftRegisterService.name);

	private _uuidUrl = 'https://api.mojang.com/users/profiles/minecraft';

	constructor(private _prisma: PrismaService, private _client: Client) {}

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
