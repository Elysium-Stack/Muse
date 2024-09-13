import { inject } from '@angular/core';
import { Route } from '@angular/router';

import { AuthenticatedGuard } from '../guards';

export const appRoutes: Route[] = [
	{
		path: '',
		loadComponent: () =>
			import('./home/home.component').then((mod) => mod.HomeComponent),
	},
	{
		path: 'dashboard',
		providers: [AuthenticatedGuard],
		canActivate: [() => inject(AuthenticatedGuard).canActivate()],
		loadChildren: () =>
			import('./dashboard/dashboard.routes').then(
				(mod) => mod.dashboardRoutes,
			),
	},
];
