import {
	CanActivate,
	ExecutionContext,
	Injectable,
	Logger,
} from '@nestjs/common';
import { NecordExecutionContext } from 'necord';

import { MessageTriggerSettingsService } from '../services/settings.service';

import { ModuleNotEnabledException } from '@util/errors';

@Injectable()
export class MessageTriggerEnabledGuard implements CanActivate {
	private readonly _logger = new Logger(MessageTriggerEnabledGuard.name);

	constructor(
		private readonly _messageTriggerSettings: MessageTriggerSettingsService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const ctx = NecordExecutionContext.create(context);
		const [interaction] = ctx.getContext<'interactionCreate'>();
		// if (!interaction.isChatInputCommand()) return false;

		const admins = process.env['OWNER_IDS'].split(',');
		if (admins.includes(interaction.user.id)) {
			return true;
		}

		const settings = await this._messageTriggerSettings.get(
			interaction.guildId
		);

		if (!settings?.enabled) {
			throw new ModuleNotEnabledException('Message Trigger');
		}

		return true;
	}
}
