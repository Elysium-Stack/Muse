import { importProvidersFrom } from '@angular/core';

import { ApiModule } from './lib/api.module';

export const provideServices = (rootUrl: string) =>
	importProvidersFrom(ApiModule.forRoot({ rootUrl }));
