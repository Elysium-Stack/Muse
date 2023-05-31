import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	Input,
	computed,
	signal,
} from '@angular/core';
import { OAuth2Guild } from '@sdk/models/o-auth-2-guild';

@Component({
	standalone: true,
	selector: 'm-guild-icon',
	imports: [CommonModule],
	templateUrl: './guild-icon.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuildIconComponent {
	@Input({ required: true })
	set guild(guild) {
		this.guild$.set(guild);
	}
	get guild() {
		return this.guild$()!;
	}

	@Input() size = 32;

	public guild$ = signal<OAuth2Guild | null>(null);

	public size$ = computed(() => `${this.size}px`);
	public type$ = computed(() => (this.guild$()!.icon ? 'icon' : 'letters'));
	public letters$ = computed(
		() =>
			(this.guild$()!.name as string)
				.split(' ')
				.map((chunk) => chunk.slice(0, 1).toUpperCase())
				.slice(0, 2)
				.join('') ?? 'G',
	);
	public iconUrl$ = computed(() =>
		this.type$() === 'icon'
			? `https://cdn.discordapp.com/icons/${this.guild$()!.id}/${
					this.guild$()!.icon
			  }`
			: undefined,
	);
}
