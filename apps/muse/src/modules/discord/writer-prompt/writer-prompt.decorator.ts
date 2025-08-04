import { createCommandGroupDecorator } from 'necord';

export const WriterPromptCommandDecorator = createCommandGroupDecorator({
	name: 'writer-prompt',
	description: 'Writer prompt command group',
});
