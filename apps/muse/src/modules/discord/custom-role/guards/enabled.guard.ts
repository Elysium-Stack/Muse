import {
	CanActivate,
	ExecutionContext,
	Injectable,
	Logger,
} from '@nestjs/common';
import { NecordExecutionContext } from 'necord';

import { CustomRoleSettingsService } from '../services/settings.service';

import { ModuleNotEnabledException } from '@util/errors';

@Injectable()
export class CustomRoleEnabledGuard implements CanActivate {
	private readonly _logger = new Logger(CustomRoleEnabledGuard.name);

	constructor(
		private readonly _customRoleSettings: CustomRoleSettingsService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const ctx = NecordExecutionContext.create(context);
		const [interaction] = ctx.getContext<'interactionCreate'>();
		// if (!interaction.isChatInputCommand()) return false;

		const admins = process.env['OWNER_IDS'].split(',');
		if (admins.includes(interaction.user.id)) {
			return true;
		}

		const settings = await this._customRoleSettings.get(
			interaction.guildId
		);

		if (!settings?.enabled) {
			throw new ModuleNotEnabledException('Custom role');
		}

		return true;
	}
}
