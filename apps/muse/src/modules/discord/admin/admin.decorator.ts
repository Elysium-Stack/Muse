import { createCommandGroupDecorator } from 'necord';

export const AdminCommandDecorator = createCommandGroupDecorator({
	name: 'admin',
	description: 'Admin command group',
});
