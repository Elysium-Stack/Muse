import {
	APIMessageTopLevelComponent,
	ActionRowData,
	JSONEncodable,
	MessageActionRowComponentBuilder,
	MessageActionRowComponentData,
	TopLevelComponentData,
} from 'discord.js';

export type DiscordComponentsArrayDTO = (
	| JSONEncodable<APIMessageTopLevelComponent>
	| TopLevelComponentData
	| ActionRowData<
			MessageActionRowComponentData | MessageActionRowComponentBuilder
	  >
	| APIMessageTopLevelComponent
)[];
