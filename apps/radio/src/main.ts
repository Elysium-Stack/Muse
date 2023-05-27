import { createLogger } from '@muse/util';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		cors: true,
		logger: createLogger('Muse Radio'),
	});
	app.setGlobalPrefix('api');

	await app.listen(3000);
}
bootstrap();
