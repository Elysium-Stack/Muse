import { Injectable, Logger } from '@nestjs/common';
import { ChannelType, Client, Events, VoiceState } from 'discord.js';
import { Kazagumo, KazagumoPlayer, KazagumoTrack } from 'kazagumo';
import Spotify from 'kazagumo-spotify';
import { On } from 'necord';
import { Connectors } from 'shoukaku';

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
									playlistPageLimit: 1, // optional ( 100 tracks per page )
									albumPageLimit: 1, // optional ( 50 tracks per page )
									searchLimit: 10, // optional ( track search limit. Max 50 )
									searchMarket: 'US', // optional || default: US ( Enter the country you live in. [ Can only be of 2 letters. For eg: US, IN, EN ] )//
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
		// shoukaku
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
		this.shoukaku.on('disconnect', (name, players, moved) => {
			this.shoukaku.on('error', (name, error) =>
				this._logger.error(`Lavalink ${name}: Error Caught,`, error),
			);
			if (moved) {
				return;
			}

			players.map((player) => player.connection.disconnect());
			console.warn(`Lavalink ${name}: Disconnected`);
		});

		// Kazagumo
		this.on('playerStart', (player, track) =>
			this._onPlayerStart(player, track),
		);
		this.on('playerEnd', (player) => this._onPlayerEnd(player));
		this.on('playerEmpty', (player) => this._onPlayerEmpty(player));
	}

	private async _onPlayerStart(player: KazagumoPlayer, track: KazagumoTrack) {
		const channel = await this._client.channels.fetch(player.textId);
		if (channel.type !== ChannelType.GuildText) {
			return;
		}

		const res = await channel.send({
			content: `Now playing **${track.title}** by **${track.author}**`,
		});
		player.data.set('message', res);
	}

	private async _onPlayerEnd(player: KazagumoPlayer) {
		player.data.get('message')?.edit({ content: `Finished playing` });
	}

	private async _onPlayerEmpty(player: KazagumoPlayer) {
		const channel = await this._client.channels.fetch(player.textId);
		if (channel.type !== ChannelType.GuildText) {
			return;
		}

		const res = await channel.send({
			content: `Destroyed player due to inactivity.`,
		});
		player.data.set('message', res);

		player.destroy();
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

		const channel = await this._client.channels.fetch(player.voiceId);
		if (channel.type !== ChannelType.GuildVoice) {
			return;
		}

		if (channel.members.size > 1) {
			return;
		}

		// TODO: Fix this
		player.data.set(
			'disconnectTimeout',
			setTimeout(() => {
				player.disconnect();
				player.data.delete('disconnectTimeout');
			}, 5000),
		);
	}
}
