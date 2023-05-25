import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { createLogger } from './util/create-logger';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		logger: createLogger(),
	});
	app.setGlobalPrefix('api');

	const config = new DocumentBuilder()
		.setTitle('Muse API')
		.setDescription("The muse API for it's dashboard")
		.setVersion('1.0')
		.addTag('muse')
		.addBearerAuth()
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('swagger', app, document);

	await app.listen(3000);
}
bootstrap();
