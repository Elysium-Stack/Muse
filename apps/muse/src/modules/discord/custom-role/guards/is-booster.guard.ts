import {
	CanActivate,
	ExecutionContext,
	Injectable,
	Logger,
} from '@nestjs/common';
import { NecordExecutionContext } from 'necord';

@Injectable()
export class CustomRoleIsBoosterGuard implements CanActivate {
	private readonly _logger = new Logger(CustomRoleIsBoosterGuard.name);

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const ctx = NecordExecutionContext.create(context);
		const [interaction] = ctx.getContext<'interactionCreate'>();

		if (!interaction.isChatInputCommand()) return false;
		const admins = process.env['OWNER_IDS'].split(',');
		if (admins.includes(interaction.user.id)) {
			return true;
		}

		const member = await interaction.guild.members.fetch(
			interaction.user.id
		);

		if (member.premiumSince) {
			return true;
		}

		return false;
	}
}
