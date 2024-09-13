import { ShutdownSignal } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { createLogger } from '@util';

import { MuseModule } from './muse.module';

async function bootstrap() {
	const app = await NestFactory.create(MuseModule, {
		cors: true,
		logger: createLogger('Muse'),
	});
	app.setGlobalPrefix('api');
	app.enableShutdownHooks(Object.values(ShutdownSignal));

	app.connectMicroservice<MicroserviceOptions>({
		transport: Transport.TCP,
		options: {
			host: '0.0.0.0',
			port: 1337,
		},
	});

	if (process.env.NODE_ENV !== 'production') {
		const config = new DocumentBuilder()
			.setTitle('Muse API')
			.setDescription("The muse API for it's dashboard")
			.setVersion('1.0')
			.addTag('muse')
			.addBearerAuth()
			.build();
		const document = SwaggerModule.createDocument(app, config);
		SwaggerModule.setup('swagger', app, document);
	}

	await app.startAllMicroservices();
	await app.listen(3000);
}
bootstrap();
