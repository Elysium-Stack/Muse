import { PlayerState } from 'kazagumo';

export class LavalinkMusicEvent {
	constructor(
		public guildId: string,
		public voiceChannelId: string | null,
		public state?: PlayerState,
	) {}
}
