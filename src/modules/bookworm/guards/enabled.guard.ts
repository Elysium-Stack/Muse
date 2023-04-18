import {
	CanActivate,
	ExecutionContext,
	Injectable,
	Logger,
} from '@nestjs/common';
import { NecordExecutionContext } from 'necord';
import { BookwormSettingsService } from '../services/settings.service';

@Injectable()
export class BookwormEnabledGuard implements CanActivate {
	private readonly _logger = new Logger(BookwormEnabledGuard.name);

	constructor(private readonly _bookwormSettings: BookwormSettingsService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const ctx = NecordExecutionContext.create(context);
		const [interaction] = ctx.getContext<'interactionCreate'>();
		if (!interaction.isChatInputCommand()) return false;

		const admins = process.env.OWNER_IDS.split(',');
		if (admins.includes(interaction.user.id)) {
			return true;
		}

		const settings = await this._bookwormSettings.get(interaction.guildId);

		if (!settings.enabled) {
			return false;
		}

		return true;
	}
}
