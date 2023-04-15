import { BaseSettingsService } from '@hermes/base';
import { SettingsService } from '@hermes/modules/settings';
import { Injectable } from '@nestjs/common';
import { BookwormSettingsInterface } from '../types/settings.interface';

@Injectable()
export class BookwormSettingsService extends BaseSettingsService<BookwormSettingsInterface> {
	protected _base = 'bookworm';

	constructor(protected _settings: SettingsService) {
		super(_settings);
	}
}
