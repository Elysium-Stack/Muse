import { Injectable, Logger } from '@nestjs/common';
import { DOGGO_BASE_URL } from '../util/constants';

export type RANDOM_KITTY_TYPES = 'normal' | 'gif' | 'cute' | 'random';

@Injectable()
export class FunDoggoService {
	private readonly _logger = new Logger(FunDoggoService.name);

	async getRandomDoggo(): Promise<null | { url: string; file: string }> {
		const html: string | null = (await fetch(DOGGO_BASE_URL)
			.then((d) => {
				if (d.status !== 200) {
					return new Promise((resolve) =>
						setTimeout(() => resolve(this.getRandomDoggo()), 300),
					);
				}

				return d?.text();
			})
			.catch((err) => {
				this._logger.error(err);
				return null;
			})) as string | null;

		if (!html?.length) {
			return null;
		}

		const videoRegex = new RegExp(/<video id=\"dog-img\"/, 'ig');

		const videoMatches = html.match(videoRegex);
		if (videoMatches?.length) {
			return this.getRandomDoggo();
		}

		const regex = new RegExp(
			/<img id=\"dog-img\" [^>]*src="[^"]*"[^>]*>/,
			'ig',
		);
		let matches: any = html.match(regex);

		if (!matches) {
			return null;
		}

		matches = matches.map((x: string) =>
			x.replace(/.*src="([^"]*)".*/, '$1'),
		);

		return {
			url: matches[0],
			file: matches[0],
		};
	}
}
