import { Injectable, Logger } from '@nestjs/common';
import { KITTY_BASE_URL } from '../util/constants';

export type RANDOM_KITTY_TYPES = 'normal' | 'gif' | 'cute' | 'random';

@Injectable()
export class FunKittyService {
	private readonly _logger = new Logger(FunKittyService.name);

	async getRandomKitty(type: RANDOM_KITTY_TYPES = 'random') {
		const types = ['', 'gif', 'cute'];
		let urlSuffix = type === 'normal' ? '' : type;

		if (type === 'random') {
			urlSuffix = types[Math.floor(Math.random() * (2 - 0 + 1) + 0)];
		}

		const data = await fetch(`${KITTY_BASE_URL}/cat/${urlSuffix}?json=true`)
			.then((d) => {
				if (d.status !== 200) {
					return new Promise((resolve) =>
						setTimeout(async () => {
							const { data } = await this.getRandomKitty(type);
							resolve(data);
						}, 300),
					);
				}

				return d?.json();
			})
			.catch((err) => {
				this._logger.error(err);
				return null;
			});

		return {
			data,
			type: data.mimetype === 'image/gif' ? 'gif' : 'normal',
		};
	}
}
