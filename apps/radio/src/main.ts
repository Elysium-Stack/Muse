import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { createLogger } from '@util';
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

	const prometheus = await NestFactory.create(AppModule, {
		logger: createLogger('Muse Radio'),
	});
	prometheus.setGlobalPrefix('api');

	await Promise.all([app.listen(), prometheus.listen(3000)]);
}

bootstrap();
