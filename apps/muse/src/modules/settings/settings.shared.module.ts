import { Module } from '@nestjs/common';

import { SettingsService } from './services';

import { PrismaModule } from '@prisma';

@Module({
	imports: [PrismaModule],
	controllers: [],
	providers: [SettingsService],
	exports: [SettingsService],
})
export class SettingsSharedModule {}
