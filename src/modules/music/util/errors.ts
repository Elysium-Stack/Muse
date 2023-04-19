import { ForbiddenException } from '@nestjs/common';

export class NotInVoiceException extends ForbiddenException {
	constructor() {
		super('You must be in a voice channel to use this command.');
	}
}

export class HasNoPlayerException extends ForbiddenException {
	constructor() {
		super('You must be in a voice channel to use this command.');
	}
}
