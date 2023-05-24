export const camelCaseToSnakeCase = (str) =>
	str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

export const snakeCaseToCamelCase = (str) =>
	str
		.toLowerCase()
		.replace(/([-_][a-z])/g, (group) =>
			group.toUpperCase().replace('-', '').replace('_', ''),
		);
