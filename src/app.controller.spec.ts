import { Test, TestingModule } from '@nestjs/testing';
import { NecordModule } from 'necord';
import { AppController } from './app.controller';
import { AppService } from './services/app.service';

describe('AppController', () => {
	let appController: AppController;

	beforeEach(async () => {
		const app: TestingModule = await Test.createTestingModule({
			imports: [
				NecordModule.forRoot({
					token: 'test',
					intents: [],
				}),
			],
			controllers: [AppController],
			providers: [AppService],
		}).compile();

		appController = app.get<AppController>(AppController);
	});

	describe('root', () => {
		it('should return "Hello from test bench!"', () => {
			expect(appController.getHello()).toBe('Hello from test bench!');
		});
	});
});
