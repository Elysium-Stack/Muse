import { EmbedBuilder } from '@discordjs/builders';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, User } from 'discord.js';
import { KazagumoPlayer, KazagumoTrack } from 'kazagumo';
import { readableTime } from './readable-time';

export const createPlayingEmbed = (
	player: KazagumoPlayer,
	track: KazagumoTrack,
) =>
	new EmbedBuilder()
		.setTitle(player.paused ? '🛑 Paused playing' : '🎶 Now Playing')
		.addFields(
			{
				name: 'Track',
				value: `[${track.title}](${track.uri})`,
				inline: true,
			},
			{
				name: 'Requested by',
				value: `<@${(track.requester as User).id}>`,
				inline: true,
			},
			{
				name: 'Duration',
				value: `\`${readableTime(track.length)}\``,
				inline: true,
			},
		);

export const createPlayingComponents = (player: KazagumoPlayer) => [
	new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId(`MUSIC_PREVIOUS`)
			.setLabel('⏮️')
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId(`MUSIC_${player.paused ? 'RESUME' : 'PAUSE'}`)
			.setLabel(player.paused ? '▶️' : '⏸️')
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId(`MUSIC_NEXT`)
			.setLabel('⏭️')
			.setStyle(ButtonStyle.Secondary),
	),
	new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId(
				`MUSIC_VOLUME_SET/${
					player.volume === 0
						? player.data.get('previousVolume') ?? 50
						: 0
				}/true`,
			)
			.setLabel('🔇')
			.setStyle(
				player.volume === 0
					? ButtonStyle.Success
					: ButtonStyle.Secondary,
			),
		new ButtonBuilder()
			.setCustomId(`MUSIC_VOLUME_DECREASE/10`)
			.setLabel('🔉')
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId(`MUSIC_VOLUME_INCREASE/10`)
			.setLabel('🔊')
			.setStyle(ButtonStyle.Secondary),
	),
	new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId(`MUSIC_SHUFFLE`)
			.setLabel('🔀')
			.setStyle(
				player.data.get('shuffled') === true
					? ButtonStyle.Success
					: ButtonStyle.Secondary,
			),
		new ButtonBuilder()
			.setCustomId(`MUSIC_STOP`)
			.setLabel('⬛')
			.setStyle(ButtonStyle.Danger),
		new ButtonBuilder()
			.setCustomId(`MUSIC_LOOP`)
			.setLabel('🔁')
			.setStyle(
				player.loop !== 'none'
					? ButtonStyle.Success
					: ButtonStyle.Secondary,
			),
	),
];
