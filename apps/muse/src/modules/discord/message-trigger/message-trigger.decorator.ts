import { createCommandGroupDecorator } from 'necord';

export const MessageTriggerCommandDecorator = createCommandGroupDecorator({
	name: 'message-trigger',
	description: 'Message trigger command group',
});
