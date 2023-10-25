import { Injectable, Logger } from '@nestjs/common';
import { MESSAGE_PREFIX } from '@util';
import { Context, SlashCommand, SlashCommandContext } from 'necord';
import { FunDoggoService } from '../services/doggo.service';
import { DOGGO_BASE_URL } from '../util/constants';
// class FunKittyRandomOptions {
// 	@StringOption({
// 		name: 'type',
// 		description: "The type of image you'd like",
// 		required: false,
// 		choices: KITTY_TYPE_OPTIONS,
// 	})
// 	type: string;
// }

@Injectable()
export class FunDoggoCommands {
	private readonly _logger = new Logger(FunDoggoCommands.name);

	constructor(private _doggo: FunDoggoService) {}

	@SlashCommand({
		name: 'doggo',
		description: 'Send a random doggo',
	})
	public async kitty(@Context() [interaction]: SlashCommandContext) {
		this._logger.debug('Sending a random doggo image');

		await interaction.deferReply();

		const data = await this._doggo.getRandomDoggo();

		if (!data) {
			return interaction.editReply({
				content: `${MESSAGE_PREFIX} Something went wrong while fetching the doggo image. Try again later.`,
			});
		}

		const splittedUrl = data.url.split('.');
		const fileType = splittedUrl[splittedUrl.length - 1];

		return interaction.editReply({
			content: '',
			files: [
				{
					attachment: `${DOGGO_BASE_URL}/${data.url}`,
					name: `doggo.${fileType}`,
				},
			],
		});
	}
}
