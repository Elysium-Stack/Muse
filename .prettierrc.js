// prettier.config.js, .prettierrc.js, prettier.config.mjs, or .prettierrc.mjs

/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
var conventions = require('./node_modules/@paperless/conventions/.prettierrc');

module.exports = Object.assign(conventions, {
	tailwindConfig: './tailwind.config.js',
});
