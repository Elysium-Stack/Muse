import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { filter, map, switchMap, take } from 'rxjs';
import { DashboardLayoutComponent } from '../components/layout/layout.component';
import { DashboardGuildService } from '../services/guild.service';

@Component({
	standalone: true,
	imports: [CommonModule, DashboardLayoutComponent, RouterModule],
	templateUrl: './guild.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardGuildComponent {
	private _route = inject(ActivatedRoute);
	private _router = inject(Router);
	private _guild = inject(DashboardGuildService);

	constructor() {
		this._guild.guildsLoaded$
			.pipe(
				takeUntilDestroyed(),
				filter((v) => !!v),
				take(1),
				switchMap(() =>
					this._route.paramMap.pipe(
						map((params) => params.get('guildId')),
						filter((guildId) => !!guildId),
						map((guildId) => guildId as string),
					),
				),
			)
			.subscribe((guildId) => {
				const result = this._guild.selectGuild(guildId);
				if (!result) {
					return this._router.navigate(['../'], {
						relativeTo: this._route,
					});
				}

				return result;
			});
	}
}
