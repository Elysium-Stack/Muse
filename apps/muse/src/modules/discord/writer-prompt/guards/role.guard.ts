import {
	CanActivate,
	ExecutionContext,
	Injectable,
	Logger,
} from '@nestjs/common';
import { Client, PermissionsBitField } from 'discord.js';
import { NecordExecutionContext } from 'necord';

import { WriterPromptSettingsService } from '../services/settings.service';

import { RequiredRoleException } from '@util/errors';

@Injectable()
export class WriterPromptRoleGuard implements CanActivate {
	private readonly _logger = new Logger(WriterPromptRoleGuard.name);

	constructor(
		private readonly _writerPromptSettings: WriterPromptSettingsService,
		private _client: Client
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const ctx = NecordExecutionContext.create(context);
		const [interaction] = ctx.getContext<'interactionCreate'>();
		// if (!interaction.isChatInputCommand()) return false;

		const admins = process.env['OWNER_IDS'].split(',');
		if (admins.includes(interaction.user.id)) {
			return true;
		}

		const guild = await this._client.guilds.fetch(interaction.guildId);
		const member = await guild.members.fetch(interaction.user.id);

		const hasPermission = member.permissions.has(
			PermissionsBitField.Flags.Administrator
		);
		if (hasPermission) {
			return true;
		}

		const settings = await this._writerPromptSettings.get(
			interaction.guildId
		);

		if (!settings?.writerRoleId) {
			return true;
		}

		if (member.roles.resolve(settings.writerRoleId)) {
			return true;
		}

		throw new RequiredRoleException();
	}
}
