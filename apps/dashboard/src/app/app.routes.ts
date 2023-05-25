import { Route } from '@angular/router';

export const appRoutes: Route[] = [
	{
		path: '',
		loadComponent: () =>
			import('./home/home.component').then((mod) => mod.HomeComponent),
	},
];
