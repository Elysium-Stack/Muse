import {
	CanActivate,
	ExecutionContext,
	Injectable,
	Logger,
} from '@nestjs/common';
import { NecordExecutionContext } from 'necord';

import { MinecraftSettingsService } from '../services/settings.service';

import { ModuleNotEnabledException } from '@util/errors';

@Injectable()
export class MinecraftEnabledGuard implements CanActivate {
	private readonly _logger = new Logger(MinecraftEnabledGuard.name);

	constructor(private readonly _minecraftSettings: MinecraftSettingsService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const ctx = NecordExecutionContext.create(context);
		const [interaction] = ctx.getContext<'interactionCreate'>();
		// if (!interaction.isChatInputCommand()) return false;

		const admins = process.env['OWNER_IDS'].split(',');
		if (admins.includes(interaction.user.id)) {
			return true;
		}

		const settings = await this._minecraftSettings.get(interaction.guildId);

		if (!settings?.enabled) {
			throw new ModuleNotEnabledException('Minecraft');
		}

		return true;
	}
}
