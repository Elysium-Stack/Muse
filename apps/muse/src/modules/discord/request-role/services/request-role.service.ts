import { getUsername } from '@muse/util/get-username';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@prisma';
import { ChannelType, Client, EmbedBuilder } from 'discord.js';
import { REQUEST_ROLE_EMBED_COLOR } from '../util/constants';
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
		const settings = await this._settings.get(guildId);
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

		if (settings.logChannelId) {
			const channel = await guild.channels.fetch(settings.logChannelId);
			if (channel && channel.type === ChannelType.GuildText) {
				const user = await this._client.users.fetch(userId);
				const embed = new EmbedBuilder()
					.setTitle(`Member received role from request`)
					.addFields(
						{
							name: 'User',
							value: `<@${userId}>`,
							inline: true,
						},
						{
							name: 'Role',
							value: `<@&${entry.roleId}>`,
							inline: true,
						},
					)
					.setAuthor({
						name: getUsername(user),
						iconURL: user.displayAvatarURL() || undefined,
					})
					.setColor(REQUEST_ROLE_EMBED_COLOR)
					.setTimestamp();

				channel.send({
					embeds: [embed],
				});
			}
		}

		return {
			success,
			role,
		};
	}
}
