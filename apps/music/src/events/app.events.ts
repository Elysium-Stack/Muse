import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { ActivityType, Client, Events } from 'discord.js';
import { Context, ContextOf, On, Once } from 'necord';
import { Gauge } from 'prom-client';

@Injectable()
export class AppEvents {
	private readonly _logger = new Logger(AppEvents.name);

	constructor(
		private _client: Client,
		@InjectMetric('discord_connected')
		public connected: Gauge<string>,
		@InjectMetric('discord_latency')
		public latency: Gauge<string>,
		@InjectMetric('discord_playing')
		public playing: Gauge<string>
	) {}

	@Cron('*/5 * * * * *')
	public latencyLoop() {
		if (!this._client) {
			return;
		}

		this.latency.labels('None').set(this._client.ws.ping);
	}

	@Once(Events.ClientReady)
	public onReady(@Context() [client]: ContextOf<Events.ClientReady>) {
		this._logger.log(`Bot logged in as ${client.user.username}`);
		this._setPresence(client);
		this.connected.labels('None').set(1);
		this.playing.labels('None').set(0);
	}

	@On(Events.Warn)
	public onWarn(@Context() [message]: ContextOf<Events.Warn>) {
		this._logger.warn(message);
	}

	private _setPresence(client: Client) {
		client.user.setPresence({
			activities: [
				{
					name: 'music 🎶',
					type: ActivityType.Listening,
				},
			],
		});
	}
}
