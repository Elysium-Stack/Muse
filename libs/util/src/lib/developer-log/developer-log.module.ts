import { Module } from '@nestjs/common';

import { DeveloperLogService } from './services';

@Module({
	imports: [],
	controllers: [],
	providers: [DeveloperLogService],
	exports: [DeveloperLogService],
})
export class DeveloperLogModule {}
