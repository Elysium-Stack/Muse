import { LavalinkMusicEvent } from '@music/util';
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron } from '@nestjs/schedule';
import { DeveloperLogService, MESSAGE_PREFIX } from '@util';
import { ChannelType, Client, Events, VoiceState } from 'discord.js';
import {
	Kazagumo,
	KazagumoPlayer,
	KazagumoTrack,
	PlayerState,
	State,
} from 'kazagumo';
import Spotify from 'kazagumo-spotify';
import { On } from 'necord';
import {
	Connectors,
	TrackExceptionEvent,
	TrackStuckEvent,
	WebSocketClosedEvent,
} from 'shoukaku';

import {
	createPlayingComponents,
	createPlayingEmbed,
} from '../util/currently-playing-embed';

@Injectable()
export class MusicLavalinkService extends Kazagumo {
	private readonly _logger = new Logger(MusicLavalinkService.name);

	private _states: { [key: string]: PlayerState } = {};

	constructor(
		private _client: Client,
		private _developerLog: DeveloperLogService,
		private _eventEmitter: EventEmitter2,
	) {
		super(
			{
				defaultSearchEngine: 'spotify',
				// MAKE SURE YOU HAVE THIS
				send: async (guildId, payload) => {
					const guild = await this._client.guilds.fetch(guildId);
					if (guild) guild.shard.send(payload);
				},
				plugins: [
					...(process.env.SPOTIFY_CLIENT_ID &&
					process.env.SPOTIFY_CLIENT_SECRET
						? [
								new Spotify({
									clientId: process.env.SPOTIFY_CLIENT_ID,
									clientSecret:
										process.env.SPOTIFY_CLIENT_SECRET,
									playlistPageLimit: 10,
									albumPageLimit: 5,
									searchLimit: 20,
									searchMarket: 'US',
								}),
						  ]
						: []),
				],
			},
			new Connectors.DiscordJS(_client),
			[
				{
					name: process.env.LAVALINK_ID!,
					url: `${process.env.LAVALINK_HOST}:${process.env.LAVALINK_PORT}`,
					auth: process.env.LAVALINK_PASSWORD!,
					secure: false,
				},
			],
		);

		this.shoukaku.on('ready', (name) => {
			this._logger.log(`Lavalink ${name} is ready!`);
			this._initializeListeners();
		});
	}

	@Cron('0 * * * * *')
	protected _checkStates() {
		for (const player of this.players.values()) {
			if (this._states[player.guildId] !== player.state) {
				this._states[player.guildId] = player.state;
				this._eventEmitter.emit(
					'music.state',
					new LavalinkMusicEvent(player, 'checkStates'),
				);
			}
		}
	}

	async getStatus() {
		const keys = this.shoukaku.nodes.keys();

		const node = this.shoukaku.nodes.get([...keys][0]);
		return node?.state === State.CONNECTED;
	}

	private _initializeListeners() {
		// Shoukaku
		this.shoukaku.on('close', (name, code, reason) =>
			this._logger.warn(
				`Lavalink ${name}: Closed, Code ${code}, Reason ${
					reason || 'No reason'
				}`,
			),
		);

		this.shoukaku.on('debug', (name, info) =>
			this._logger.debug(`Lavalink ${name}: Debug,`, info),
		);

		this.shoukaku.on('error', async (name, ...args) => {
			this._logger.error(`Lavalink ${name}: Error,`, ...args);
			await this._developerLog.sendError(
				{ args },
				`Lavalink ${name}: Error`,
				'MusicLavalinkService',
			);
		});

		this.shoukaku.on('disconnect', (name: any, moved: any) => {
			this.shoukaku.on('error', async (name, error) => {
				this._logger.error(`Lavalink ${name}: Error Caught,`, error);
				await this._developerLog.sendError(
					error,
					`Lavalink ${name}: Error`,
					'MusicLavalinkService',
				);
			});

			if (moved) {
				return;
			}

			const players = [...this.players.keys()].map((key: string) =>
				this.players.get(key),
			);
			players.map((player: any) => player.connection.disconnect());
			this._logger.warn(`Lavalink ${name}: Disconnected`);
		});

		// basic errors

		// Kazagumo
		this.on('playerStart', (player, track) =>
			this._onPlayerStart(player, track),
		);
		this.on('playerEnd', (player) => this._onPlayerEnd(player));
		this.on('playerEmpty', (player) => this._onPlayerEmpty(player));
		this.on('playerDestroy', (player) => this._onPlayerDestroy(player));

		// basic errors
		this.on('playerClosed', (player, data) =>
			this._onPlayerClose(player, data),
		);

		this.on('playerResolveError', (_, __, message) =>
			this._logger.error(
				`Player resolve error\n ${JSON.stringify({ message })}`,
			),
		);

		this.on('playerStuck', (player, data) =>
			this._onPlayerStuck(player, data),
		);

		this.on('playerException', (player, data) =>
			this._onPlayerException(player, data),
		);
	}

	private async _onPlayerStart(player: KazagumoPlayer, track: KazagumoTrack) {
		this._logger.log(`Player start for ${player.guildId}`);
		this.createPlayerMessage(player, track);
		this._eventEmitter.emit(
			'music.connected',
			new LavalinkMusicEvent(player, 'playerStart', { track }),
		);
	}

	private async _onPlayerEnd(player: KazagumoPlayer) {
		this._logger.log(`Player end for ${player.guildId}`);
		player.data
			.get('message')
			?.delete()
			.catch(() => null);
	}

	private async _onPlayerDestroy(player: KazagumoPlayer) {
		this._logger.log(`Player destroyed for ${player.guildId}`);

		this._eventEmitter.emit(
			'music.disconnected',
			new LavalinkMusicEvent(player, 'playerDestroy'),
		);
		player.data
			.get('message')
			?.delete()
			.catch(() => null);
	}

	private async _onPlayerClose(
		player: KazagumoPlayer,
		data: WebSocketClosedEvent,
	) {
		this._logger.warn(
			`Player closed for ${player.guildId} ${
				player.textId
			} ${JSON.stringify(data)}`,
		);

		this._eventEmitter.emit(
			'music.disconnected',
			new LavalinkMusicEvent(player, 'playerClosed', data),
		);
	}

	private async _onPlayerEmpty(player: KazagumoPlayer) {
		this._logger.log(`Player empty for ${player.guildId}`);

		const channel = await this._client.channels.fetch(player.textId!);
		if (channel?.type !== ChannelType.GuildText) {
			return;
		}

		player.data
			.get('message')
			?.delete()
			.catch(() => null);

		await channel.send({
			content: `${MESSAGE_PREFIX} No more songs to play, disconnecting.`,
		});

		player.destroy();
	}

	private async _onPlayerStuck(
		player: KazagumoPlayer,
		data: TrackStuckEvent,
	) {
		this._logger.error(`Player stuck\n ${JSON.stringify({ data })}`);

		const channel = await this._client.channels.fetch(player.textId!);

		let skipping = true;
		if (player.queue.size === 0 && player.loop === 'none') {
			skipping = false;
		}

		if (skipping) {
			player.skip();
		}

		if (!skipping) {
			player.destroy();
		}

		await this._developerLog.sendError(
			data,
			`Player got stuck, ${
				skipping ? 'Skipping song.' : 'please try again.'
			}`,
			'MusicLavalinkService',
			player.guildId,
		);

		if (channel?.type !== ChannelType.GuildText) {
			return;
		}
		await channel.send({
			content: `${MESSAGE_PREFIX} Player got stuck, ${
				skipping ? 'Skipping song.' : 'please try again.'
			}`,
		});
	}

	private async _onPlayerException(
		player: KazagumoPlayer,
		data: TrackExceptionEvent,
	) {
		this._logger.error(`Player exception\n ${JSON.stringify({ data })}`);

		let skipping = true;
		if (player.queue.size === 0 && player.loop === 'none') {
			skipping = false;
		}

		if (skipping) {
			player.skip();
		}

		if (!skipping) {
			player.destroy();
		}

		await this._developerLog.sendError(
			data,
			`Something wen't wrong, ${
				skipping ? 'Skipping song' : 'please try again'
			}.`,
			'MusicLavalinkService',
			player.guildId,
		);
	}

	@On(Events.VoiceStateUpdate)
	async _onVoiceStateUpdate([
		{
			guild: { id },
		},
	]: VoiceState[]) {
		const player = this.players.get(id);
		if (!player) {
			return;
		}

		const timeout = player.data.get('disconnectTimeout');
		if (timeout) {
			clearTimeout(timeout);
		}

		if (player.data.get('radio') || player.data.get('no-dc')) {
			return;
		}

		if (!player.voiceId) {
			return;
		}

		const channel = await this._client.channels.fetch(player.voiceId);
		if (channel?.type !== ChannelType.GuildVoice) {
			return;
		}

		if (channel.members.size > 1) {
			return;
		}

		const textChannel = await this._client.channels.fetch(player.textId!);
		player.data.set(
			'disconnectTimeout',
			setTimeout(async () => {
				if (textChannel?.type === ChannelType.GuildText) {
					await textChannel.send({
						content: `${MESSAGE_PREFIX} Disconnected player due to inactivity.`,
					});
				}
				player.destroy();
				player.data.delete('disconnectTimeout');
			}, 5000),
		);
	}

	async createPlayerMessage(
		player: KazagumoPlayer,
		track: KazagumoTrack | null | undefined,
	) {
		player.data
			.get('message')
			?.delete()
			.catch(() => null);

		const channel = await this._client.channels.fetch(player.textId!);
		if (channel?.type !== ChannelType.GuildText) {
			return;
		}

		if (!track) {
			return;
		}

		const res = await channel.send({
			embeds: [createPlayingEmbed(player, track)],
			components: player.data.get('radio')
				? []
				: createPlayingComponents(player),
		});
		player.data.set('message', res);
	}
}
