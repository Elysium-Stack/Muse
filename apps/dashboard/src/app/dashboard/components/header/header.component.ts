import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { cssMenuLeft } from '@ng-icons/css.gg';
import { UserButtonComponent } from 'apps/dashboard/src/components/user-button/user-button.component';
import { DashboardSidebarService } from '../../services/sidebar.service';
import { DashboardBreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component';

@Component({
	standalone: true,
	selector: 'm-dashboard-header',
	imports: [
		CommonModule,
		DashboardBreadcrumbsComponent,
		UserButtonComponent,
		NgIconComponent,
	],
	providers: [provideIcons({ cssMenuLeft })],
	templateUrl: './header.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		class: 'sticky top-0 left-0 z-20',
	},
})
export class DashboardHeaderComponent {
	private _sidebar = inject(DashboardSidebarService);

	showSidebar() {
		this._sidebar.show();
	}
}
