import { Injectable, Logger } from '@nestjs/common';
import { ChannelType, Client, Events, VoiceState } from 'discord.js';
import { Kazagumo, KazagumoPlayer, KazagumoTrack } from 'kazagumo';
import Spotify from 'kazagumo-spotify';
import { On } from 'necord';
import { Connectors, TrackExceptionEvent, TrackStuckEvent } from 'shoukaku';
import {
	createPlayingComponents,
	createPlayingEmbed,
} from '../util/currently-playing-embed';

@Injectable()
export class LavalinkService extends Kazagumo {
	private readonly _logger = new Logger(LavalinkService.name);

	constructor(private _client: Client) {
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
									playlistPageLimit: 1,
									albumPageLimit: 1,
									searchLimit: 10,
									searchMarket: 'US',
								}),
						  ]
						: []),
				],
			},
			new Connectors.DiscordJS(_client),
			[
				{
					name: process.env.LAVALINK_ID,
					url: `${process.env.LAVALINK_HOST}:${process.env.LAVALINK_PORT}`,
					auth: process.env.LAVALINK_PASSWORD,
					secure: false,
				},
			],
		);

		this.shoukaku.on('ready', (name) => {
			this._logger.log(`Lavalink ${name} is ready!`);
			this._initializeListeners();
		});
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
		this.shoukaku.on('error', (name, ...args) =>
			this._logger.error(`Lavalink ${name}: Error,`, ...args),
		);
		this.shoukaku.on('disconnect', (name, players, moved) => {
			this.shoukaku.on('error', (name, error) =>
				this._logger.error(`Lavalink ${name}: Error Caught,`, error),
			);
			if (moved) {
				return;
			}

			players.map((player) => player.connection.disconnect());
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
			this._logger.warn(
				`Player closed for ${player.guildId} ${
					player.textId
				} ${JSON.stringify(data)}`,
			),
		);
		this.on('playerResolveError', (player, track, message) =>
			this._logger.error(
				`Player start\n ${JSON.stringify({ player, track, message })}`,
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
	}

	private async _onPlayerEnd(player: KazagumoPlayer) {
		this._logger.log(`Player end for ${player.guildId}`);
		player.data.get('message')?.delete();
	}

	private async _onPlayerDestroy(player: KazagumoPlayer) {
		this._logger.log(`Player destroyed for ${player.guildId}`);
		player.data.get('message')?.delete();
	}

	private async _onPlayerEmpty(player: KazagumoPlayer) {
		this._logger.log(`Player empty for ${player.guildId}`);

		const channel = await this._client.channels.fetch(player.textId);
		if (channel.type !== ChannelType.GuildText) {
			return;
		}

		player.data.get('message')?.delete();

		await channel.send({
			content: `No more songs to play, disconnecting.`,
		});

		player.destroy();
	}

	private async _onPlayerStuck(
		player: KazagumoPlayer,
		data: TrackStuckEvent,
	) {
		this._logger.error(`Player stuck\n ${JSON.stringify({ data })}`);

		const channel = await this._client.channels.fetch(player.textId);
		player.destroy();

		if (channel.type !== ChannelType.GuildText) {
			return;
		}

		await channel.send({
			content: `Player got stuck, please try again.`,
		});
	}

	private async _onPlayerException(
		player: KazagumoPlayer,
		data: TrackExceptionEvent,
	) {
		this._logger.error(`Player exception\n ${JSON.stringify({ data })}`);

		const channel = await this._client.channels.fetch(player.textId);
		player.destroy();

		if (channel.type !== ChannelType.GuildText) {
			return;
		}

		await channel.send({
			content: `Something wen't wrong, please try again.`,
		});
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

		if (!player.voiceId) {
			return;
		}

		const channel = await this._client.channels.fetch(player.voiceId);
		if (channel.type !== ChannelType.GuildVoice) {
			return;
		}

		if (channel.members.size > 1) {
			return;
		}

		const textChannel = await this._client.channels.fetch(player.textId);
		player.data.set(
			'disconnectTimeout',
			setTimeout(async () => {
				if (textChannel.type === ChannelType.GuildText) {
					await textChannel.send({
						content: `Disconnected player due to inactivity.`,
					});
				}
				player.destroy();
				player.data.delete('disconnectTimeout');
			}, 5000),
		);
	}

	async createPlayerMessage(player: KazagumoPlayer, track: KazagumoTrack) {
		player.data
			.get('message')
			?.delete()
			.catch(() => null);

		const channel = await this._client.channels.fetch(player.textId);
		if (channel.type !== ChannelType.GuildText) {
			return;
		}

		const res = await channel.send({
			embeds: [createPlayingEmbed(player, track)],
			components: createPlayingComponents(player),
		});
		player.data.set('message', res);
	}
}
