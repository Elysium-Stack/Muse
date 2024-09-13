import { Injectable, Logger } from '@nestjs/common';
import { MESSAGE_PREFIX } from '@util';
import { ChatInputCommandInteraction } from 'discord.js';
import { Context, SlashCommand, SlashCommandContext } from 'necord';

import { FunAnimalService } from '../services/animal.service';
import { AnimelType } from '../types/animal-type';
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
export class FunAnimalCommands {
	private readonly _logger = new Logger(FunAnimalCommands.name);

	constructor(private _animal: FunAnimalService) {}

	@SlashCommand({
		name: 'kitty',
		description: 'Send a random kitty',
	})
	public async kitty(@Context() [interaction]: SlashCommandContext) {
		return this._runType(interaction, 'cat', 'kitty');
	}

	@SlashCommand({
		name: 'doggo',
		description: 'Send a random doggo',
	})
	public async doggo(@Context() [interaction]: SlashCommandContext) {
		return this._runType(interaction, 'dog', 'doggo');
	}

	@SlashCommand({
		name: 'foxy',
		description: 'Send a random foxy',
	})
	public async foxy(@Context() [interaction]: SlashCommandContext) {
		return this._runType(interaction, 'fox', 'foxy');
	}

	@SlashCommand({
		name: 'fishy',
		description: 'Send a random fishy',
	})
	public async fishy(@Context() [interaction]: SlashCommandContext) {
		return this._runType(interaction, 'fish', 'fishy');
	}

	@SlashCommand({
		name: 'alpaca',
		description: 'Send a random alpha',
	})
	public async alpaca(@Context() [interaction]: SlashCommandContext) {
		return this._runType(interaction, 'alpaca', 'alpaca');
	}

	@SlashCommand({
		name: 'birb',
		description: 'Send a random birb',
	})
	public async birb(@Context() [interaction]: SlashCommandContext) {
		return this._runType(interaction, 'bird', 'birb');
	}

	@SlashCommand({
		name: 'froag',
		description: 'Send a random froag',
	})
	public async froag(@Context() [interaction]: SlashCommandContext) {
		return this._runType(interaction, 'frog', 'froag');
	}

	private async _runType(
		interaction: ChatInputCommandInteraction,
		type: AnimelType | 'frog',
		friendlyName: string
	) {
		this._logger.debug(`Sending a random ${type} image`);
		await interaction.deferReply();

		let image: string;

		if (type !== 'frog') {
			image = await this._animal.getRandom(type);
		}

		if (type === 'frog') {
			image = await this._animal.getRandomFrog();
		}

		if (!image) {
			return interaction.editReply({
				content: `${MESSAGE_PREFIX} Something went wrong while fetching the ${friendlyName} image. Try again later.`,
			});
		}

		return interaction.editReply({
			content: '',
			files: [
				{
					attachment: image,
					name: `${type}.png'}`,
				},
			],
		});
	}
}
