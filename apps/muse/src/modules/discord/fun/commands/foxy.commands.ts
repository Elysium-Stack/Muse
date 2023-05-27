import { MESSAGE_PREFIX } from '@muse/util';
import { Injectable, Logger } from '@nestjs/common';
import { Context, SlashCommand, SlashCommandContext } from 'necord';
import { FunFoxyService } from '../services/foxy.service';

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
export class FunFoxyCommands {
	private readonly _logger = new Logger(FunFoxyCommands.name);

	constructor(private _foxy: FunFoxyService) {}

	@SlashCommand({
		name: 'foxy',
		description: 'Send a random foxy',
	})
	public async kitty(@Context() [interaction]: SlashCommandContext) {
		this._logger.debug('Sending a random foxy image');

		await interaction.deferReply();

		const data = await this._foxy.getRandomFoxy();

		if (!data) {
			return interaction.editReply({
				content: `${MESSAGE_PREFIX} Something went wrong while fetching the foxy image. Try again later.`,
			});
		}

		const splittedUrl = data.image.split('.');
		const fileType = splittedUrl[splittedUrl.length - 1];

		return interaction.editReply({
			content: '',
			files: [
				{
					attachment: data.image,
					name: `foxy.${fileType}`,
				},
			],
		});
	}
}
