import { Module } from '@nestjs/common';
import { PrismaService } from './services';

@Module({
	imports: [],
	controllers: [],
	providers: [PrismaService],
	exports: [PrismaService],
})
export class PrismaModule {}
