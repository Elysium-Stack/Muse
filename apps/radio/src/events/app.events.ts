import { MusicLavalinkService } from '@music';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@prisma';
import { ActivityType, Client, Events } from 'discord.js';
import { Context, ContextOf, On, Once } from 'necord';
import { RadioService } from '../services/radio.service';

@Injectable()
export class AppEvents {
	private readonly _logger = new Logger(AppEvents.name);

	constructor(
		private _prisma: PrismaService,
		private _lavalink: MusicLavalinkService,
		private _radio: RadioService,
	) {}

	@Once(Events.ClientReady)
	public onReady(@Context() [client]: ContextOf<Events.ClientReady>) {
		this._logger.log(`Bot logged in as ${client.user.username}`);
		this._setPresence(client);
		this._checkPlaying();
	}

	@On(Events.Warn)
	public onWarn(@Context() [message]: ContextOf<Events.Warn>) {
		this._logger.warn(message);
	}

	private _setPresence(client: Client) {
		client.user!.setPresence({
			activities: [
				{
					name: 'to the radio 📻',
					type: ActivityType.Listening,
				},
			],
		});
	}

	private async _checkPlaying() {
		this._logger.log(`Checking if we need to resume playing.`);

		const logs = await this._prisma.radioLog.findMany();

		if (!logs.length) {
			return;
		}

		const itterateLogs = () => {
			this._logger.debug('Lavalink is ready, resuming radio.');
			this._lavalink.removeListener('ready', itterateLogs);
			for (const { guildId } of logs) {
				this._logger.debug(`Resuming radio for ${guildId}`);
				this._radio.startWithoutConfig(guildId);
			}
		};

		if (this._lavalink.shoukaku.nodes.size === 0) {
			this._lavalink.shoukaku.on('ready', itterateLogs);
			return;
		}

		itterateLogs();
	}
}
