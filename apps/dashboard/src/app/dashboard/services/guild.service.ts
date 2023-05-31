import { Injectable, computed, inject, signal } from '@angular/core';
import { GuildsService } from '@sdk';
import { BotOAuth2GuildDto } from '@sdk/models/bot-o-auth-2-guild-dto';
import { BehaviorSubject, take } from 'rxjs';

@Injectable()
export class DashboardGuildService {
	private _guild = inject(GuildsService);

	public guildsLoaded$ = new BehaviorSubject<boolean>(false);

	public loadingGuilds$ = signal<boolean>(false);
	public guilds$ = signal<BotOAuth2GuildDto[]>([]);

	public selectedGuildId$ = signal<string | null>(null);
	public selectedGuild$ = computed(
		() =>
			this.availableGuilds$().find(
				(g) => g.id === this.selectedGuildId$(),
			) || null,
	);

	public availableGuilds$ = computed(() =>
		this.guilds$()
			.filter(({ available }) => available)
			.map((g) => g.guild),
	);
	public unavailableGuilds$ = computed(() =>
		this.guilds$()
			.filter(({ available }) => !available)
			.map((g) => g.guild),
	);

	constructor() {
		if (!this.guilds$().length) {
			this.loadGuilds();
		}
	}

	loadGuilds() {
		this.loadingGuilds$.set(true);
		this._guild
			.guildsControllerGuilds()
			.pipe(take(1))
			.subscribe({
				next: (guilds) => {
					this.guilds$.set(guilds);
					this.loadingGuilds$.set(false);
					this.guildsLoaded$.next(true);
				},
				complete: () => this.loadingGuilds$.set(false),
			});
	}

	selectGuild(id: string) {
		const guild = this.availableGuilds$().find((g) => g.id === id);
		if (!guild) {
			return false;
		}

		this.selectedGuildId$.set(id);

		return true;
	}
}
