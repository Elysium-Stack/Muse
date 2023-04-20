import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MuseLogger } from './logger/logger.service';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		bufferLogs: true,
	});
	app.useLogger(app.get(MuseLogger));
	await app.listen(3000);
}
bootstrap();
