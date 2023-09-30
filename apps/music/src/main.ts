import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { createLogger } from '@util';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		logger: createLogger('Muse Music'),
	});

	app.connectMicroservice<MicroserviceOptions>({
		transport: Transport.RMQ,
		options: {
			urls: [
				`amqp://${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`,
			],
			queue: 'music_queue',
			queueOptions: {
				durable: false,
				noAck: false,
			},
		},
	});

	app.setGlobalPrefix('api');

	await app.startAllMicroservices();
	await app.listen(3000);
}

bootstrap();
