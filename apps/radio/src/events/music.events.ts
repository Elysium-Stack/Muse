import { LavalinkMusicEvent } from '@music/util';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RadioService } from '@radio/services/radio.service';
import { MESSAGE_PREFIX } from '@util/constants';
import { ChannelType, Client } from 'discord.js';

@Injectable()
export class MusicEvents {
	private readonly _logger = new Logger(MusicEvents.name);
	private _startTimeout: NodeJS.Timer;
	private _retryCount = 0;

	constructor(private _radio: RadioService, private _client: Client) {}

	@OnEvent('music.disconnected')
	handleMusicDisconnected({ player, source, data }: LavalinkMusicEvent) {
		if (source === 'playerClosed') {
			if (data.byRemote) {
				player.destroy();
			}
			return;
		}

		if (this._startTimeout) {
			clearTimeout(this._startTimeout);
			this._startTimeout = null;
		}
		const autoRestart = player.data.get('auto-restart');

		if (autoRestart) {
			this._startTimeout = setTimeout(async () => {
				const channel = await this._client.channels.fetch(
					player.textId!,
				);

				if (this._retryCount === 4) {
					this._logger.warn(
						"No longer resuming, we've tried 5 times",
					);

					this._retryCount = 0;

					if (channel?.type !== ChannelType.GuildText) {
						return;
					}
					return await channel.send({
						content: `${MESSAGE_PREFIX} Radio stopped. The radio was not able to restart after 5 retries, please restart the radio manually.`,
					});
				}

				this._retryCount += 1;

				this._logger.warn(
					"Resuming the closed player because it's the radio",
				);

				await this._radio.startWithoutConfig(player.guildId);

				if (channel?.type !== ChannelType.GuildText) {
					return;
				}
				await channel.send({
					content: `${MESSAGE_PREFIX} Radio reconnected. If this was a mistake, please stop the radio manually.`,
				});
			}, 5000);
		}
	}
}
