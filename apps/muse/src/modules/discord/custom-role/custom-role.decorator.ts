import { createCommandGroupDecorator } from 'necord';

export const CustomRoleCommandDecorator = createCommandGroupDecorator({
	name: 'role',
	description: 'Custom role command group',
});
