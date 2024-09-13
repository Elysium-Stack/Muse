import {
	CanActivate,
	ExecutionContext,
	Injectable,
	Logger,
} from '@nestjs/common';
import { Client, PermissionsBitField } from 'discord.js';
import { NecordExecutionContext } from 'necord';

import { MusicSettingsService } from '../services/settings.service';

@Injectable()
export class MusicIsDJGuard implements CanActivate {
	private readonly _logger = new Logger(MusicIsDJGuard.name);

	constructor(
		private readonly _musicSettings: MusicSettingsService,
		private _client: Client
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const ctx = NecordExecutionContext.create(context);
		const [interaction] = ctx.getContext<'interactionCreate'>();
		// if (!interaction.isChatInputCommand()) return false;

		const admins = process.env.OWNER_IDS!.split(',');
		if (admins.includes(interaction.user.id)) {
			return true;
		}

		const guild = await this._client.guilds.fetch(interaction.guildId!);
		const member = await guild.members.fetch(interaction.user.id);

		const hasPermission = member.permissions.has(
			PermissionsBitField.Flags.Administrator
		);
		if (hasPermission) {
			return true;
		}

		const settings = await this._musicSettings.get(interaction.guildId!);

		// TODO: Check role
		if (!settings?.enabled) {
			return false;
		}

		return true;
	}
}
