import { Route } from '@angular/router';

export const guildRoutes: Route[] = [
	{
		path: '',
		loadComponent: () =>
			import('./guild.component').then(
				(mod) => mod.DashboardGuildComponent,
			),
		children: [
			{
				path: '',
				pathMatch: 'full',
				loadComponent: () =>
					import('./dashboard/dashboard.component').then(
						(mod) => mod.DashboardGuildDashboardComponent,
					),
			},
			{
				path: 'module',
				pathMatch: 'full',
				redirectTo: 'music',
			},
			{
				path: 'music',
				loadComponent: () =>
					import('./music/music.component').then(
						(mod) => mod.DashboardModulesMusicComponent,
					),
			},
			{
				path: 'music/radio',
				loadComponent: () =>
					import('./radio/radio.component').then(
						(mod) => mod.DashboardModulesRadioComponent,
					),
			},
			{
				path: 'module/bookworm',
				loadComponent: () =>
					import('./bookworm/bookworm.component').then(
						(mod) => mod.DashboardModulesBookwomComponent,
					),
			},
			{
				path: 'module/feedback',
				loadComponent: () =>
					import('./feedback/feedback.component').then(
						(mod) => mod.DashboardModulesFeedbackComponent,
					),
			},
			{
				path: 'module/reaction-trigger',
				loadComponent: () =>
					import(
						'./reaction-trigger/reaction-trigger.component'
					).then(
						(mod) => mod.DashboardModulesReactionTriggerComponent,
					),
			},
			{
				path: 'module/fun',
				loadComponent: () =>
					import('./fun/fun.component').then(
						(mod) => mod.DashboardModulesFunComponent,
					),
			},
		],
	},
];
