import { ModuleNotEnabledException } from '@muse/util/errors';
import {
	CanActivate,
	ExecutionContext,
	Injectable,
	Logger,
} from '@nestjs/common';
import { NecordExecutionContext } from 'necord';
import { ReactionTriggerSettingsService } from '../services/settings.service';

@Injectable()
export class ReactionTriggerEnabledGuard implements CanActivate {
	private readonly _logger = new Logger(ReactionTriggerEnabledGuard.name);

	constructor(
		private readonly _reactionTriggerSettings: ReactionTriggerSettingsService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const ctx = NecordExecutionContext.create(context);
		const [interaction] = ctx.getContext<'interactionCreate'>();
		// if (!interaction.isChatInputCommand()) return false;

		const admins = process.env.OWNER_IDS!.split(',');
		if (admins.includes(interaction.user.id)) {
			return true;
		}

		const settings = await this._reactionTriggerSettings.get(
			interaction.guildId!,
		);

		if (!settings?.enabled) {
			throw new ModuleNotEnabledException('Music');
		}

		return true;
	}
}
