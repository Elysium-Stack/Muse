import { baseEnvironment } from './environment.base';

export const environment = {
	...baseEnvironment,
	production: true,
	bot: {
		inviteUrl:
			'https://discord.com/oauth2/authorize?client_id=1096889146775195780&scope=bot&permissions=527710547199',
	},
	api: {
		baseUrl: 'https://muse.the-river-styx.com',
	},
};
