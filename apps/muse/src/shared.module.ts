import { Module } from '@nestjs/common';
import { PrismaModule } from '@prisma';

import { SettingsSharedModule } from './modules/settings';

@Module({
	imports: [PrismaModule, SettingsSharedModule],
	exports: [PrismaModule, SettingsSharedModule],
})
export class SharedModule {}
