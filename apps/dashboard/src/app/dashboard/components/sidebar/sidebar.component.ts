import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	effect,
	inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
	cssBookmark,
	cssChevronDown,
	cssChevronRight,
	cssCollage,
	cssFeed,
	cssInbox,
	cssMusic,
	cssMusicSpeaker,
	cssSmile,
} from '@ng-icons/css.gg';
import { GuildIconComponent } from 'apps/dashboard/src/components/guild-icon/guild-icon.component';
import { environment } from 'apps/dashboard/src/environment/environment';
import { filter } from 'rxjs';

import { DashboardGuildService } from '../../services/guild.service';
import { DashboardSidebarService } from '../../services/sidebar.service';

@Component({
	standalone: true,
	selector: 'm-dashboard-sidebar',
	imports: [CommonModule, NgIconComponent, RouterModule, GuildIconComponent],
	providers: [
		provideIcons({
			cssChevronRight,
			cssChevronDown,
			cssCollage,
			cssMusic,
			cssMusicSpeaker,
			cssFeed,
			cssSmile,
			cssInbox,
			cssBookmark,
		}),
	],
	templateUrl: './sidebar.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		class: 'relative z-50',
	},
})
export class DashboardSidebarComponent {
	private _sidebar = inject(DashboardSidebarService);
	private _guild = inject(DashboardGuildService);
	private _host = inject(ElementRef);
	private _router = inject(Router);

	public inviteUrl = environment.bot.inviteUrl;

	public show$ = this._sidebar.show$;
	public loadingGuilds$ = this._guild.loadingGuilds$;
	public availableGuilds$ = this._guild.availableGuilds$;
	public unavailableGuilds$ = this._guild.unavailableGuilds$;
	public selectedGuild$ = this._guild.selectedGuild$;

	constructor() {
		const checkFn = (ev: MouseEvent) => this._checkHide(ev);

		effect(() => {
			document.removeEventListener('click', checkFn);

			if (this.show$()) {
				setTimeout(() => document.addEventListener('click', checkFn), 100);
				return;
			}
		});

		this._router.events
			.pipe(
				takeUntilDestroyed(),
				filter(e => e instanceof NavigationEnd)
			)
			.subscribe(() => this._sidebar.hide());
	}

	private _checkHide({ target }: MouseEvent) {
		setTimeout(() => {
			if (!this._host.nativeElement.contains(target)) {
				this._sidebar.hide();
			}
		}, 0);
	}
}
