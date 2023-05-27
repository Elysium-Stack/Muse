import { MESSAGE_PREFIX } from '@muse/util';
import { Injectable, Logger } from '@nestjs/common';
import { Context, SlashCommand, SlashCommandContext } from 'necord';
import { FunKittyService } from '../services/kitty.service';
import { KITTY_BASE_URL } from '../util/constants';

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
export class FunKittyCommands {
	private readonly _logger = new Logger(FunKittyCommands.name);

	constructor(private _kitty: FunKittyService) {}

	@SlashCommand({
		name: 'kitty',
		description: 'Send a random kitty',
	})
	public async kitty(@Context() [interaction]: SlashCommandContext) {
		this._logger.debug('Sending a random kitty image');

		await interaction.deferReply();

		const { data, type } = await this._kitty.getRandomKitty();

		if (!data) {
			return interaction.editReply({
				content: `${MESSAGE_PREFIX} Something went wrong while fetching the kitty image. Try again later.`,
			});
		}

		return interaction.editReply({
			content: '',
			files: [
				{
					attachment: `${KITTY_BASE_URL}${data.url}`,
					name: `kitty.${type === 'gif' ? 'gif' : 'png'}`,
				},
			],
		});
	}
}
