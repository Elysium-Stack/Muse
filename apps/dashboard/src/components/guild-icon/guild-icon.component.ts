import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	input,
} from '@angular/core';
import { OAuth2Guild } from 'discord.js';

@Component({
	standalone: true,
	selector: 'm-guild-icon',
	imports: [CommonModule],
	templateUrl: './guild-icon.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuildIconComponent {
	guild = input<OAuth2Guild>();
	size = input(32);

	public sizeInPixels = computed(() => `${this.size()}px`);
	public type = computed(() => (this.guild()?.icon ? 'icon' : 'letters'));
	public letters = computed(
		() =>
			(this.guild()?.name as string)
				.split(' ')
				.map(chunk => chunk.slice(0, 1).toUpperCase())
				.slice(0, 2)
				.join('') ?? 'G'
	);
	public iconUrl = computed(() =>
		this.type() === 'icon'
			? `https://cdn.discordapp.com/icons/${this.guild()?.id}/${
					this.guild()?.icon
				}`
			: undefined
	);
}
