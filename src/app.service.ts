import { Injectable, Logger } from '@nestjs/common';
import { Client } from 'discord.js';
import { Context, ContextOf, On, Once } from 'necord';

@Injectable()
export class AppService {
	private readonly _logger = new Logger(AppService.name);

	constructor(private readonly _client: Client) {}

	getHello(): string {
		const name = this._client.user.username;
		return `Hello from ${name}!`;
	}

	@Once('ready')
	public onReady(@Context() [client]: ContextOf<'ready'>) {
		this._logger.log(`Bot logged in as ${client.user.username}`);
	}

	@On('warn')
	public onWarn(@Context() [message]: ContextOf<'warn'>) {
		this._logger.warn(message);
	}
}
