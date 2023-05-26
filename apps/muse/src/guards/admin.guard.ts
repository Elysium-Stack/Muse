import {
	CanActivate,
	ExecutionContext,
	Injectable,
	Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { NecordExecutionContext } from 'necord';

@Injectable()
export class AdminGuard implements CanActivate {
	private readonly _logger = new Logger(AdminGuard.name);

	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const ctx = NecordExecutionContext.create(context);
		const [interaction] = ctx.getContext<'interactionCreate'>();

		if (!interaction) {
			return true;
		}

		if (
			interaction.isUserContextMenuCommand() ||
			interaction.isContextMenuCommand()
		) {
			return false;
		}

		const admins = process.env.OWNER_IDS!.split(',');
		if (!admins.includes(interaction.user.id)) {
			return false;
		}

		return true;
	}
}
