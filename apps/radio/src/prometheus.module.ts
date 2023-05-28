import { Module } from '@nestjs/common';
import { PrometheusModule as PtsModule } from '@willsoto/nestjs-prometheus';

@Module({
	imports: [PtsModule.register()],
})
export class PrometheusModule {}
