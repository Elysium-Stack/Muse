import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { filter, map, of, switchMap, take } from 'rxjs';

import { UserService } from '../services/user.service';

@Component({
	standalone: true,
	imports: [RouterModule],
	selector: 'muse-dashboard-root',
	templateUrl: './app.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
	private _router = inject(Router);
	private _route = inject(ActivatedRoute);
	private _user = inject(UserService);

	constructor() {
		this._route.queryParamMap
			.pipe(
				takeUntilDestroyed(),
				filter(params => params.has('code')),
				take(1),
				map(params => params.get('code')),
				switchMap(code => {
					if (!code) {
						return of(code);
					}
					this._router.navigate([]);
					return this._user.signin$(code).pipe(take(1));
				}),
				filter(r => !!r)
			)
			.subscribe(() => this._router.navigate(['/dashboard']));
	}
}
