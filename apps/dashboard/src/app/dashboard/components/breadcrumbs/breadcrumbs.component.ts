import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	inject,
	signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { cssChevronRight } from '@ng-icons/css.gg';
import { UserService } from 'apps/dashboard/src/services/user.service';
import { filter, map } from 'rxjs';
import { DashboardPageTitleComponent } from '../page-title/page-title.component';

@Component({
	standalone: true,
	selector: 'm-dashboard-breacrumbs',
	imports: [
		CommonModule,
		NgIconComponent,
		RouterModule,
		DashboardPageTitleComponent,
	],
	providers: [provideIcons({ cssChevronRight })],
	templateUrl: './breadcrumbs.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardBreadcrumbsComponent {
	private _router = inject(Router);
	private _user = inject(UserService);

	public loadingUser$ = this._user.loadingUser$;
	public user$ = this._user.user$;

	public segments$ = signal<
		{
			link?: string;
			label: string;
		}[]
	>([]);

	constructor() {
		// this._router.events.pipe(
		// 	takeUntilDestroyed(),
		// 	tap((e) => console.log(e)),
		// 	filter((e) => e instanceof NavigationEnd),
		// 	map((e) => {
		// 		console.log(e);
		// 		return e;
		// 	}),
		// );

		this._setSegments(this._router.url);
		this._router.events
			.pipe(
				takeUntilDestroyed(),
				filter((e) => e instanceof NavigationEnd),
				map((e) => (e as NavigationEnd).url),
			)
			.subscribe((url) => this._setSegments(url));
	}

	private _setSegments(url: string) {
		const splitted = url.split('/');
		splitted.splice(0, 3);

		if (!splitted.length) {
			this.segments$.set([]);
		}

		const segments = splitted.map((segment) => ({
			link:
				segment === 'music' && splitted.length > 1
					? './music'
					: undefined,
			label: segment.replace(/-/g, ' '),
		}));

		this.segments$.set(segments);
	}
}
