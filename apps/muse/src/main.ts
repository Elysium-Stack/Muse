import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createLogger } from './util/create-logger';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		logger: createLogger(),
	});
	await app.listen(3000);
}
bootstrap();
