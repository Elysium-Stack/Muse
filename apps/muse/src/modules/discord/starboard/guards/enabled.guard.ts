import {
	CanActivate,
	ExecutionContext,
	Injectable,
	Logger,
} from '@nestjs/common';
import { ModuleNotEnabledException } from '@util/errors';
import { NecordExecutionContext } from 'necord';
import { StarboardSettingsService } from '../services/settings.service';

@Injectable()
export class StarboardEnabledGuard implements CanActivate {
	private readonly _logger = new Logger(StarboardEnabledGuard.name);

	constructor(
		private readonly _starboardSettings: StarboardSettingsService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const ctx = NecordExecutionContext.create(context);
		const [interaction] = ctx.getContext<'interactionCreate'>();
		// if (!interaction.isChatInputCommand()) return false;

		const admins = process.env.OWNER_IDS!.split(',');
		if (admins.includes(interaction.user.id)) {
			return true;
		}

		const settings = await this._starboardSettings.get(
			interaction.guildId!,
		);

		if (!settings?.enabled) {
			throw new ModuleNotEnabledException('Starboard');
		}

		return true;
	}
}
