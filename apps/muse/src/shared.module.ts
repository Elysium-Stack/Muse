import { Module } from '@nestjs/common';

import { SettingsSharedModule } from './modules/settings';

import { PrismaModule } from '@prisma';


@Module({
	imports: [PrismaModule, SettingsSharedModule],
	exports: [PrismaModule, SettingsSharedModule],
})
export class SharedModule {}
