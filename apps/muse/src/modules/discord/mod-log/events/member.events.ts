import { EMBED_STATUS_COLORS } from '@muse/util/constants';
import { getUsername } from '@muse/util/get-username';
import { Injectable, Logger } from '@nestjs/common';
import { Client, EmbedBuilder, Events } from 'discord.js';
import { Context, ContextOf, On } from 'necord';
import { ModLogSettingsService } from '../services';

@Injectable()
export class ModLogMemberEvents {
	private readonly _logger = new Logger(ModLogMemberEvents.name);

	constructor(
		private _settings: ModLogSettingsService,
		private _client: Client,
	) {}

	@On(Events.GuildMemberAdd)
	public async onGuildMemberAdd(
		@Context() [member]: ContextOf<Events.GuildMemberAdd>,
	) {
		const guildId = member.guild.id;
		const { enabled, joinChannelId } = await this._settings.get(guildId);

		if (!enabled || !joinChannelId?.length) {
			return;
		}

		const user = await this._client.users.fetch(member.user.id);

		this._logger.log(`Mod log member join running for ${guildId}`);

		const embed = new EmbedBuilder()
			.setTitle(`Member joined`)
			.addFields(
				{
					name: 'User',
					value: `<@${user.id}>`,
					inline: true,
				},
				{
					name: 'Created',
					value: `<t:${Math.round(user.createdTimestamp / 1000)}:R>`,
					inline: true,
				},
				{
					name: 'Joined',
					value: `<t:${Math.round(member.joinedTimestamp / 1000)}:R>`,
					inline: true,
				},
				{
					name: 'ID',
					value: user.id,
				},
			)
			.setAuthor({
				name: getUsername(user),
				iconURL: user.displayAvatarURL() || undefined,
			})
			.setColor(EMBED_STATUS_COLORS.success)
			.setTimestamp();

		const joinChannel = await member.guild.channels.fetch(joinChannelId);

		if (!joinChannel.isTextBased()) {
			return;
		}

		await joinChannel.send({ embeds: [embed] });
	}

	@On(Events.GuildMemberRemove)
	public async onGuildMemberRemove(
		@Context() [member]: ContextOf<Events.GuildMemberRemove>,
	) {
		const guildId = member.guild.id;
		const { enabled, leaveChannelId } = await this._settings.get(guildId);

		if (!enabled || !leaveChannelId?.length) {
			return;
		}

		const user = await this._client.users.fetch(member.user.id);

		this._logger.log(`Mod log member leave running for ${guildId}`);

		const roles = await member.roles.cache
			.filter((r) => r.name !== '@everyone')
			.map((r) => r.id);

		const embed = new EmbedBuilder()
			.setTitle(`Member left`)
			.addFields(
				{
					name: 'User',
					value: `<@${user.id}>`,
					inline: true,
				},
				{
					name: 'Created',
					value: `<t:${Math.round(user.createdTimestamp / 1000)}:R>`,
					inline: true,
				},
				{
					name: 'Joined',
					value: `<t:${Math.round(member.joinedTimestamp / 1000)}:R>`,
					inline: true,
				},
				{
					name: 'ID',
					value: user.id,
					inline: true,
				},
				{
					name: 'Roles',
					value: roles.length
						? roles.map((id) => `<@&${id}>`).join(', ')
						: 'None',
					inline: !roles.length,
				},
			)
			.setAuthor({
				name: getUsername(user),
				iconURL: user.displayAvatarURL() || undefined,
			})
			.setColor(EMBED_STATUS_COLORS.danger)
			.setTimestamp();

		const leaveChannel = await member.guild.channels.fetch(leaveChannelId);

		if (!leaveChannel.isTextBased()) {
			return;
		}

		await leaveChannel.send({ embeds: [embed] });
	}
}
