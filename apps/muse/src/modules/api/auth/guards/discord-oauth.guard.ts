import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class DiscordOAuthGuard extends AuthGuard('discord') {
	constructor() {
		super({
			accessType: 'offline',
		});
	}
}
