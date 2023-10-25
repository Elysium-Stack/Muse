import { createCommandGroupDecorator } from 'necord';

export const RequestRoleCommandDecorator = createCommandGroupDecorator({
	name: 'request-role',
	description: 'Request role command group',
});
