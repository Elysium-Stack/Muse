import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { cssMenuRight } from '@ng-icons/css.gg';

import { environment } from '../../environment/environment';
import { UserService } from '../../services/user.service';
import { UserButtonComponent } from '../user-button/user-button.component';

@Component({
	standalone: true,
	selector: 'm-navigation',
	imports: [CommonModule, UserButtonComponent, NgIconComponent, RouterModule],
	providers: [provideIcons({ cssMenuRight })],
	templateUrl: './navigation.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationComponent {
	private _user = inject(UserService);

	public inviteUrl = environment.bot.inviteUrl;
	public signinUrl = `${environment.api.baseUrl}/api/auth`;

	public user$ = this._user.user$;
	public loadingUser$ = this._user.loadingUser$;

	signout() {
		this._user.signout();
	}
}
