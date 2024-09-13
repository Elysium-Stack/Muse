import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	Input,
	inject,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { cssChevronDown, cssLogOut, cssRedo } from '@ng-icons/css.gg';

import { environment } from '../../environment/environment';
import { UserService } from '../../services/user.service';

@Component({
	standalone: true,
	selector: 'm-user-button',
	imports: [CommonModule, NgIconComponent, RouterModule],
	providers: [provideIcons({ cssChevronDown, cssRedo, cssLogOut })],
	templateUrl: './user-button.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserButtonComponent {
	private _user = inject(UserService);
	private _router = inject(Router);

	public signinUrl = `${environment.api.baseUrl}/api/auth`;

	public user$ = this._user.user$;
	public loadingUser$ = this._user.loadingUser$;

	@Input() showDashboard = true;

	signout() {
		this._user.signout();
		this._router.navigate(['/']);
	}
}
