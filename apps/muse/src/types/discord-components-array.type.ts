import {
	APIActionRowComponent,
	APIMessageActionRowComponent,
	ActionRowData,
	JSONEncodable,
	MessageActionRowComponentBuilder,
	MessageActionRowComponentData,
} from 'discord.js';

export type DiscordComponentsArrayDTO = (
	| JSONEncodable<APIActionRowComponent<APIMessageActionRowComponent>>
	| ActionRowData<
			MessageActionRowComponentData | MessageActionRowComponentBuilder
	  >
	| APIActionRowComponent<APIMessageActionRowComponent>
)[];
