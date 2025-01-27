import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '@prisma';

@Injectable()
export class CustomRoleGeneralService {
	private readonly _logger = new Logger(CustomRoleGeneralService.name);

	constructor(private _prisma: PrismaService) {}

	findByGuildAndUserId(guildId: string, userId: string) {
		return this._prisma.customRoleMap.findFirst({
			where: {
				guildId,
				userId,
			},
		});
	}

	findByGuildAndRoleId(guildId: string, roleId: string) {
		return this._prisma.customRoleMap.findFirst({
			where: {
				guildId,
				roleId,
			},
		});
	}

	create(guildId: string, userId: string, roleId: string) {
		return this._prisma.customRoleMap.create({
			data: {
				guildId,
				userId,
				roleId,
			},
		});
	}

	removeByGuildAndUserId(guildId: string, userId: string) {
		return this._prisma.customRoleMap.deleteMany({
			where: {
				guildId,
				userId,
			},
		});
	}

	removeByGuildAndRoleId(guildId: string, roleId: string) {
		return this._prisma.customRoleMap.deleteMany({
			where: {
				guildId,
				roleId,
			},
		});
	}

	async getMappings(guildId: string, page = 1) {
		const where = {
			guildId,
		};

		const mappings = await this._prisma.customRoleMap.findMany({
			where,
			skip: 10 * (page - 1),
			take: 10,
		});
		const total = await this._prisma.customRoleMap.count({
			where,
		});

		return {
			mappings,
			total,
		};
	}
}
