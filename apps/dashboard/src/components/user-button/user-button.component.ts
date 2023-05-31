import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	Input,
	inject,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { cssChevronDown, cssRedo } from '@ng-icons/css.gg';
import { environment } from '../../environment/environment';
import { UserService } from '../../services/user.service';

@Component({
	standalone: true,
	selector: 'm-user-button',
	imports: [CommonModule, NgIconComponent, RouterModule],
	providers: [provideIcons({ cssChevronDown, cssRedo })],
	templateUrl: './user-button.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserButtonComponent {
	private _user = inject(UserService);

	public signinUrl = `${environment.api.baseUrl}/api/auth`;

	public user$ = this._user.user$;
	public loadingUser$ = this._user.loadingUser$;

	@Input() showDashboard = true;

	signout() {
		this._user.signout();
	}
}
