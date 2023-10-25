import { Injectable, Logger } from '@nestjs/common';
import { AnimelType } from '../types/animal-type';
import { RANDOM_ANIMAL_BASE_URL } from '../util/constants';

export type RANDOM_KITTY_TYPES = 'normal' | 'gif' | 'cute' | 'random';

@Injectable()
export class FunAnimalService {
	private readonly _logger = new Logger(FunAnimalService.name);

	async getRandom(type: AnimelType) {
		const data = await fetch(`${RANDOM_ANIMAL_BASE_URL}/${type}`)
			.then((d) => {
				if (d.status !== 200) {
					return new Promise((resolve) =>
						setTimeout(async () => {
							const data = await this.getRandom(type);
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

		return data.message;
	}
}
