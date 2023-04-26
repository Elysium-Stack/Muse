import { Injectable, Logger } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { ActivityType, Client, Events } from 'discord.js';
import { Context, ContextOf, On, Once } from 'necord';
import { Counter } from 'prom-client';

@Injectable()
export class AppEvents {
	private readonly _logger = new Logger(AppEvents.name);

	constructor(
		@InjectMetric('discord_connected')
		public connected: Counter<string>,
	) {}

	@Once(Events.ClientReady)
	public onReady(@Context() [client]: ContextOf<Events.ClientReady>) {
		this._logger.log(`Bot logged in as ${client.user.username}`);
		this.connected.inc(1);
		this._setPresence(client);
	}

	@On(Events.Warn)
	public onWarn(@Context() [message]: ContextOf<Events.Warn>) {
		this._logger.warn(message);
	}

	private _setPresence(client: Client) {
		client.user.setPresence({
			activities: [
				{
					name: 'you 👀',
					type: ActivityType.Watching,
				},
			],
		});
	}
}
