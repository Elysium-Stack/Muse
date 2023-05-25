import { ChangeDetectionStrategy, Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { UserService } from '../services/user.service';

@Component({
	standalone: true,
	imports: [RouterModule],
	selector: 'muse-dashboard-root',
	templateUrl: './app.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
	constructor(
		private _router: Router,
		private _route: ActivatedRoute,
		private _user: UserService,
	) {
		this._route.queryParamMap
			.pipe(
				takeUntilDestroyed(),
				filter((params) => params.has('code')),
				take(1),
				map((params) => params.get('code')!),
			)
			.subscribe((code) => {
				this._router.navigate([]);
				this._user.signin(code);
			});
	}
}
