import { ModuleNotEnabledException } from '@muse/util/errors';
import {
	CanActivate,
	ExecutionContext,
	Injectable,
	Logger,
} from '@nestjs/common';
import { NecordExecutionContext } from 'necord';
import { MusicSettingsService } from '../services/settings.service';

@Injectable()
export class MusicEnabledGuard implements CanActivate {
	private readonly _logger = new Logger(MusicEnabledGuard.name);

	constructor(private readonly _musicSettings: MusicSettingsService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const ctx = NecordExecutionContext.create(context);
		const [interaction] = ctx.getContext<'interactionCreate'>();
		// if (!interaction.isChatInputCommand()) return false;

		const admins = process.env.OWNER_IDS!.split(',');
		if (admins.includes(interaction.user.id)) {
			return true;
		}

		const settings = await this._musicSettings.get(interaction.guildId!);

		if (!settings?.enabled) {
			throw new ModuleNotEnabledException('Music');
		}

		return true;
	}
}
