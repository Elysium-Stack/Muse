import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { cssChevronDown, cssRedo } from '@ng-icons/css.gg';

import { environment } from '../../environment/environment';
import { UserService } from '../../services/user.service';

@Component({
	standalone: true,
	selector: 'm-navigation',
	imports: [CommonModule, NgIconComponent],
	providers: [provideIcons({ cssChevronDown, cssRedo })],
	templateUrl: './navigation.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationComponent {
	public inviteUrl = environment.bot.inviteUrl;
	public signinUrl = `${environment.api.baseUrl}/api/auth`;

	public user$ = this._user.user$;
	public loadingUser$ = this._user.loadingUser$;

	constructor(private _user: UserService) {}

	signout() {
		this._user.signout();
	}
}
