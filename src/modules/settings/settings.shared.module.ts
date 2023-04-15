import { PrismaModule } from '@hermes/prisma';
import { Module } from '@nestjs/common';
import { SettingsService } from './services';

@Module({
	imports: [PrismaModule],
	controllers: [],
	providers: [SettingsService],
	exports: [SettingsService],
})
export class SettingsSharedModule {}
