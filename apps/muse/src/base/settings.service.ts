import { SettingsService } from '@muse/settings';

import { Settings } from '@prisma/client';

export abstract class BaseSettingsService<T> {
	protected _base = '';

	constructor(protected _settings: SettingsService) {}

	async get(guildId: string, doCheck = true) {
		const settings = await this._settings.getSettings(guildId, doCheck);

		if (!settings) {
			return null;
		}

		return this._formatSettings(settings);
	}

	async set(guildId: string, key: string, value: unknown) {
		const defaultKey = `${this._base}${key
			.charAt(0)
			.toUpperCase()}${key.slice(1)}`;
		this._settings.setKey(guildId, defaultKey, value);
	}

	async setObj(guildId: string, obj: Partial<T>) {
		const parsedObj = {};
		for (const key of Object.keys(obj)) {
			parsedObj[`${this._base}${key.charAt(0).toUpperCase()}${key.slice(1)}`] =
				obj[key];
		}

		this._settings.setObj(guildId, parsedObj);
	}

	private _formatSettings(settings: Settings): T {
		const parsedSettings= {};

		for (const [key, value] of Object.entries(settings)) {
			if (key.startsWith(this._base)) {
				let parsedKey = key.replace(this._base, '');
				parsedKey = parsedKey.charAt(0).toLowerCase() + parsedKey.slice(1);

				parsedSettings[parsedKey] = value;
			}
		}

		return parsedSettings as T;
	}
}
