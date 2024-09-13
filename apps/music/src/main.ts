import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { createLogger } from '@util';

import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		logger: createLogger('Muse Music'),
	});

	app.connectMicroservice<MicroserviceOptions>({
		transport: Transport.TCP,
		options: {
			host: '0.0.0.0',
			port: 1337,
		},
	});

	app.setGlobalPrefix('api');

	await app.startAllMicroservices();
	await app.listen(3000);
}

bootstrap();
