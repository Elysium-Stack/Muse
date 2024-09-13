import {
	HTTP_INTERCEPTORS,
	provideHttpClient,
	withInterceptorsFromDi,
} from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import {
	provideRouter,
	withEnabledBlockingInitialNavigation,
} from '@angular/router';
import { provideServices } from '@sdk';

import { environment } from '../environment/environment';
import { AuthInterceptor } from '../services/auth.interceptor';
import { TokenStorageService } from '../services/token-storage.service';
import { UserService } from '../services/user.service';

import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
	providers: [
		provideHttpClient(withInterceptorsFromDi()),
		{
			provide: HTTP_INTERCEPTORS,
			useClass: AuthInterceptor,
			multi: true,
		},
		provideServices(environment.api.baseUrl),
		provideRouter(appRoutes, withEnabledBlockingInitialNavigation()),

		TokenStorageService,
		UserService,
	],
};
