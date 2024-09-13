import { KazagumoPlayer } from 'kazagumo';

export class LavalinkMusicEvent {
	constructor(
		public player: KazagumoPlayer,
		public source: string,
		public data?: any
	) {}
}
