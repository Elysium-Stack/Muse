import {
	CanActivate,
	ExecutionContext,
	Injectable,
	Logger,
} from '@nestjs/common';
import { NecordExecutionContext } from 'necord';

import { TimezoneSettingsService } from '../services/settings.service';

import { ModuleNotEnabledException } from '@util/errors';

@Injectable()
export class TimezoneEnabledGuard implements CanActivate {
	private readonly _logger = new Logger(TimezoneEnabledGuard.name);

	constructor(private readonly _timezoneSettings: TimezoneSettingsService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const ctx = NecordExecutionContext.create(context);
		const [interaction] = ctx.getContext<'interactionCreate'>();
		// if (!interaction.isChatInputCommand()) return false;

		const admins = process.env['OWNER_IDS'].split(',');
		if (admins.includes(interaction.user.id)) {
			return true;
		}

		const settings = await this._timezoneSettings.get(interaction.guildId);

		if (!settings?.enabled) {
			throw new ModuleNotEnabledException('Timezone');
		}

		return true;
	}
}
