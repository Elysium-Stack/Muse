import {
	APIActionRowComponent,
	APIMessageActionRowComponent,
	ActionRowData,
	JSONEncodable,
	MessageActionRowComponentBuilder,
	MessageActionRowComponentData,
} from 'discord.js';

export type DiscordComponentsArray = (
	| JSONEncodable<APIActionRowComponent<APIMessageActionRowComponent>>
	| ActionRowData<
			MessageActionRowComponentData | MessageActionRowComponentBuilder
	  >
	| APIActionRowComponent<APIMessageActionRowComponent>
)[];
