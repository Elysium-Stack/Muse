import { Injectable, Logger } from '@nestjs/common';
import { FOXY_BASE_URL } from '../util/constants';

export type RANDOM_KITTY_TYPES = 'normal' | 'gif' | 'cute' | 'random';

@Injectable()
export class FunFoxyService {
	private readonly _logger = new Logger(FunFoxyService.name);

	async getRandomFoxy(): Promise<{ image: string } | null> {
		return fetch(`${FOXY_BASE_URL}/floof`)
			.then((d: Response) => {
				if (d.status !== 200) {
					return new Promise((resolve) =>
						setTimeout(() => resolve(this.getRandomFoxy()), 300),
					);
				}

				return d?.json();
			})
			.catch((err) => {
				this._logger.error(err);
				return null;
			}) as Promise<{ image: string } | null>;
	}
}
