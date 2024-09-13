import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ParticlesHeaderComponent } from 'apps/dashboard/src/components/particles-header/particles-header.component';

import { DashboardHeaderComponent } from '../header/header.component';
import { DashboardSidebarComponent } from '../sidebar/sidebar.component';

@Component({
	standalone: true,
	selector: 'm-dashboard-layout',
	imports: [
		CommonModule,
		DashboardSidebarComponent,
		DashboardHeaderComponent,
		ParticlesHeaderComponent,
	],
	templateUrl: './layout.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		class: 'flex h-screen overflow-hidden gap-0 md:gap-6 px-4',
	},
})
export class DashboardLayoutComponent {}
