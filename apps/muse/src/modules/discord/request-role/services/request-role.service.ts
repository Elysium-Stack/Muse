import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@prisma';
import { Client } from 'discord.js';
import { RequestRoleSettingsService } from './settings.service';
@Injectable()
export class RequestRoleGeneralService {
	private readonly _logger = new Logger(RequestRoleGeneralService.name);

	constructor(
		private _prisma: PrismaService,
		private _client: Client,
		private _settings: RequestRoleSettingsService,
	) {}

	public getEntryById(id: number) {
		return this._prisma.requestRoleEntries.findFirst({
			where: {
				id,
			},
		});
	}

	public getEntryByRoleId(guildId: string, roleId: string) {
		return this._prisma.requestRoleEntries.findFirst({
			where: {
				roleId,
				guildId,
			},
		});
	}

	public getAllEntries(guildId: string) {
		return this._prisma.requestRoleEntries.findMany({
			where: {
				guildId,
			},
		});
	}

	public async getEntriesPerPage(guildId: string, page = 1) {
		const where = {
			guildId,
		};

		const total = await this._prisma.requestRoleEntries.count({
			where,
		});

		const entries = await this._prisma.requestRoleEntries.findMany({
			where,
			skip: 10 * (page - 1),
			take: 10,
		});

		return {
			entries,
			total,
		};
	}

	public addEntry(guildId: string, roleId: string, tos: string) {
		return this._prisma.requestRoleEntries.create({
			data: {
				guildId,
				roleId,
				tos,
			},
		});
	}

	public setRolesById(id: number, requiredRoles: string[]) {
		return this._prisma.requestRoleEntries.update({
			where: {
				id,
			},
			data: {
				requiredRoles,
			},
		});
	}

	public async removeEntryById(guildId: string, id: number) {
		const trigger = await this._prisma.requestRoleEntries.findFirst({
			where: {
				guildId,
				id,
			},
		});

		if (!trigger) {
			return null;
		}

		await this._prisma.requestRoleEntries.delete({
			where: {
				id: trigger.id,
			},
		});

		return trigger;
	}

	public async giveRole(guildId: string, userId: string, entryId: number) {
		const entry = await this.getEntryById(entryId);
		const guild = await this._client.guilds.fetch(guildId);
		if (!guild) {
			return;
		}

		const member = await guild.members.fetch(userId);
		if (!member) {
			return;
		}

		const role = await guild.roles.fetch(entry.roleId);

		const success = await member.roles
			.add(role)
			.then(() => true)
			.catch((e) => {
				this._logger.warn(
					`Could not set role ${entry.roleId} on ${userId} in ${guildId}`,
				);
				return false;
			});

		return {
			success,
			role,
		};
	}
}
