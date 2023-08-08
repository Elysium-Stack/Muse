import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@prisma';

@Injectable()
export class SettingsService {
	private readonly _logger = new Logger(SettingsService.name);

	constructor(private _prisma: PrismaService) {}

	async getSettings(guildId: string, doCheck = true) {
		this._logger.verbose(`Getting settings for guild: ${guildId}`);

		if (doCheck) {
			return this.checkSettings(guildId);
		}

		return this._prisma.settings.findUnique({
			where: {
				guildId,
			},
		});
	}

	async checkSettings(guildId: string) {
		const settings = await this._prisma.settings.findUnique({
			where: {
				guildId,
			},
		});

		if (!settings) {
			return this._prisma.settings.create({
				data: { guildId },
			});
		}

		return settings;
	}

	async setKey(guildId: string, key: string, value: any) {
		const settings = await this.getSettings(guildId);

		return this._prisma.settings.update({
			where: {
				guildId,
			},
			data: {
				...settings,
				[key]: value,
			},
		});
	}

	async setObj(guildId: string, obj: any) {
		const settings = await this.getSettings(guildId);

		return this._prisma.settings.update({
			where: {
				guildId,
			},
			data: {
				...settings,
				...obj,
			},
		});
	}
}
