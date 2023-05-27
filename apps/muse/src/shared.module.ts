import { PrismaModule } from '@muse/prisma';
import { Module } from '@nestjs/common';
import { SettingsSharedModule } from './modules/settings';

@Module({
	imports: [PrismaModule, SettingsSharedModule],
	exports: [PrismaModule, SettingsSharedModule],
})
export class SharedModule {}
