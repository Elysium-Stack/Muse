import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { UserService } from 'apps/dashboard/src/services/user.service';
import { DashboardPageTitleComponent } from '../../components/page-title/page-title.component';
import { DashboardGuildService } from '../../services/guild.service';

@Component({
	standalone: true,
	imports: [CommonModule, DashboardPageTitleComponent],
	templateUrl: './dashboard.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardGuildDashboardComponent {
	private _guild = inject(DashboardGuildService);
	private _user = inject(UserService);

	public selectedGuild$ = this._guild.selectedGuild$;

	public loadingUser$ = this._user.loadingUser$;
	public user$ = this._user.user$;
}
