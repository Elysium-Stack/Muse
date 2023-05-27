import { IncorrectChannelException } from '@muse/util/errors';
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
export class MusicChannelGuard implements CanActivate {
	private readonly _logger = new Logger(MusicChannelGuard.name);

	constructor(
		private readonly _musicSettings: MusicSettingsService,
		private _client: Client,
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
			PermissionsBitField.Flags.Administrator,
		);
		if (hasPermission) {
			return true;
		}

		const settings = await this._musicSettings.get(interaction.guildId!);

		if (!settings?.channelId) {
			return true;
		}

		if (settings.channelId === interaction.channelId) {
			return true;
		}

		throw new IncorrectChannelException(settings.channelId);
	}
}
