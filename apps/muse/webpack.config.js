const { composePlugins, withNx } = require('@nx/webpack');
const path = require('path');
const webpack = require('webpack');
const ts = require('typescript');

const SwaggerPluginOptions = {
	dtoFileNameSuffix: ['.dto.ts', '.entity.ts', '.type.ts'],
	classValidatorShim: true,
	introspectComments: true,
};

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), config => {
	// Update the webpack config as needed here.
	// e.g. `config.plugins.push(new MyPlugin())`

	config.module.rules
		.filter(rule => rule.loader?.includes('ts-loader'))
		.forEach(tsRule => {
			tsRule.options = { ...tsRule.options };
			tsRule.options.transpileOnly = false;
			tsRule.options.getCustomTransformers = addSwaggerPluginTransformer(
				tsRule.options.getCustomTransformers
			);
		});

	config.plugins = [
		...(config.plugins || []),
		new webpack.ProvidePlugin({
			openapi: '@nestjs/swagger',
		}),
	];

	return config;
});

function addSwaggerPluginTransformer(prevGetCustomTransformers) {
	return program => {
		const customTransformers = {
			...(prevGetCustomTransformers
				? prevGetCustomTransformers(program)
				: undefined),
		};
		customTransformers.before = [
			require('@nestjs/swagger/plugin').before(SwaggerPluginOptions, program),
			...(customTransformers.before || []),
		];
		return customTransformers;
	};
}
