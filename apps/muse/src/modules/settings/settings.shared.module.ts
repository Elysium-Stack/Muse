import { Module } from '@nestjs/common';
import { PrismaModule } from '@prisma';
import { SettingsService } from './services';

@Module({
	imports: [PrismaModule],
	controllers: [],
	providers: [SettingsService],
	exports: [SettingsService],
})
export class SettingsSharedModule {}
