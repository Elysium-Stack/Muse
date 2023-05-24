import { SettingsService } from '@muse/settings';
import { Settings } from '@prisma/client';

export abstract class BaseSettingsService<T> {
	protected _base: string;

	constructor(protected _settings: SettingsService) {}

	async get(guildId: string, doCheck = true) {
		const settings = await this._settings.getSettings(guildId, doCheck);

		if (!settings) {
			return;
		}

		return this._formatSettings(settings);
	}

	async set(guildId: string, key: string, value: any) {
		const defaultKey = `${this._base}${key
			.charAt(0)
			.toUpperCase()}${key.slice(1)}`;
		this._settings.setKey(guildId, defaultKey, value);
	}

	private _formatSettings(settings: Settings): T {
		const newSettings = {};

		for (const [key, value] of Object.entries(settings)) {
			if (key.startsWith(this._base)) {
				let newKey = key.replace(this._base, '');
				newKey = newKey.charAt(0).toLowerCase() + newKey.slice(1);

				newSettings[newKey] = value;
			}
		}

		return newSettings as T;
	}
}