import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { createLogger } from '@util';
import { MuseModule } from './muse.module';

import { ShutdownSignal } from '@nestjs/common';

async function bootstrap() {
	const app = await NestFactory.create(MuseModule, {
		cors: true,
		logger: createLogger('Muse'),
	});
	app.setGlobalPrefix('api');
	app.enableShutdownHooks(Object.values(ShutdownSignal));

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

	await app.listen(3000);
}
bootstrap();
