import { createLogger } from '@muse/util';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.createMicroservice<MicroserviceOptions>(
		AppModule,
		{
			logger: createLogger('Muse Radio'),
			transport: Transport.REDIS,
			options: {
				host: process.env.REDIS_HOST,
				port: parseInt(process.env.REDIS_PORT, 10),
			},
		},
	);
	await app.listen();
}
bootstrap();
