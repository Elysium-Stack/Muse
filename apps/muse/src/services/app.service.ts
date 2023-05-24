import { Injectable, Logger } from '@nestjs/common';
import { Client } from 'discord.js';

@Injectable()
export class AppService {
	private readonly _logger = new Logger(AppService.name);

	constructor(private readonly _client: Client) {}

	getHello(): string {
		this._logger.verbose('Hello from the logger! :D');
		return `Hello from ${this._client.user?.username ?? 'test bench'}!`;
	}
}
