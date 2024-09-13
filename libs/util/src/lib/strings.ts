export const camelCaseToSnakeCase = (str: string) =>
	str.replaceAll(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

export const snakeCaseToCamelCase = (str: string) =>
	str
		.toLowerCase()
		.replaceAll(/([_-][a-z])/g, group =>
			group.toUpperCase().replace('-', '').replace('_', '')
		);
