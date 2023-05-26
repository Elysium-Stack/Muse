import {
	CanActivate,
	ExecutionContext,
	Injectable,
	Logger,
} from '@nestjs/common';
import { NecordExecutionContext } from 'necord';
import { MusicPlayerService } from '../services/player.service';
import { NotInVoiceException } from '../util/errors';

@Injectable()
export class MusicInVoiceGuard implements CanActivate {
	private readonly _logger = new Logger(MusicInVoiceGuard.name);

	constructor(private _player: MusicPlayerService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const ctx = NecordExecutionContext.create(context);
		const [interaction] = ctx.getContext<'interactionCreate'>();
		if (
			interaction.isContextMenuCommand() ||
			interaction.isUserContextMenuCommand()
		) {
			return false;
		}

		const member = await interaction.guild!.members.fetch(
			interaction.user.id,
		);
		const { channel } = member.voice;
		if (!channel) {
			throw new NotInVoiceException();
		}

		const player = this._player.get(interaction.guild!.id);
		if (player && player.voiceId !== channel.id) {
			throw new NotInVoiceException();
		}

		return true;
	}
}
