import { ForbiddenException } from '@nestjs/common';

export class ModuleNotEnabledException extends ForbiddenException {
	constructor(name?: string) {
		super(`${name ? `The ${name}` : 'This'} module is not enabled.`);
	}
}

export class IncorrectChannelException extends ForbiddenException {
	constructor(channelId?: string) {
		super(
			`This is the incorrect channel${
				channelId ? `, please use <#${channelId}>` : ''
			}.`,
		);
	}
}

export class RequiredRoleException extends ForbiddenException {
	constructor() {
		super(`You're not allowed to use this command.`);
	}
}
