import {
	CanActivate,
	ExecutionContext,
	Injectable,
	Logger,
} from '@nestjs/common';
import { NecordExecutionContext } from 'necord';

import { WriterPromptSettingsService } from '../services/settings.service';

import { ModuleNotEnabledException } from '@util/errors';

@Injectable()
export class WriterPromptEnabledGuard implements CanActivate {
	private readonly _logger = new Logger(WriterPromptEnabledGuard.name);

	constructor(
		private readonly _writerPromptSettings: WriterPromptSettingsService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const ctx = NecordExecutionContext.create(context);
		const [interaction] = ctx.getContext<'interactionCreate'>();
		// if (!interaction.isChatInputCommand()) return false;

		const admins = process.env['OWNER_IDS'].split(',');
		if (admins.includes(interaction.user.id)) {
			return true;
		}

		const settings = await this._writerPromptSettings.get(
			interaction.guildId
		);

		if (!settings?.enabled) {
			throw new ModuleNotEnabledException('Writer prompt');
		}

		return true;
	}
}
