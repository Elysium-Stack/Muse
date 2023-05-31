import { Route } from '@angular/router';
import { DashboardGuildService } from './services/guild.service';
import { DashboardSidebarService } from './services/sidebar.service';

export const dashboardRoutes: Route[] = [
	{
		path: '',
		providers: [DashboardSidebarService, DashboardGuildService],
		loadComponent: () =>
			import('./dashboard.component').then(
				(mod) => mod.DashboardComponent,
			),
		children: [
			{
				path: '',
				pathMatch: 'full',
				loadComponent: () =>
					import('./select-guild/select-guild.component').then(
						(mod) => mod.DashboardSelectGuildComponent,
					),
			},
			{
				path: ':guildId',
				loadChildren: () =>
					import('./guild/guild.routes').then(
						(mod) => mod.guildRoutes,
					),
			},
		],
	},
];
