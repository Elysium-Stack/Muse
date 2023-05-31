import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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

	public selectedGuild$ = this._guild.selectedGuild$;
}
