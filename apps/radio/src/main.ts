import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { createLogger } from '@util';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		logger: createLogger('Muse Radio'),
	});

	app.connectMicroservice<MicroserviceOptions>({
		transport: Transport.REDIS,
		options: {
			host: process.env.REDIS_HOST,
			port: parseInt(process.env.REDIS_PORT, 10),
		},
	});

	app.setGlobalPrefix('api');

	await app.startAllMicroservices();
	await app.listen(3000);
}

bootstrap();
