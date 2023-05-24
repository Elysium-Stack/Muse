const {
	createGlobPatternsForDependencies,
} = require('@nxtensions/astro/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		join(
			__dirname,
			'src/**/!(*.stories|*.spec).{astro,html,js,jsx,md,svelte,ts,tsx,vue}',
		),
		...createGlobPatternsForDependencies(__dirname),
	],
	theme: {
		extend: {},
	},
	daisyui: {
		themes: [
			{
				muse: {
					primary: '#67e8f9',
					secondary: '#9333ea',
					accent: '#fde68a',
					neutral: '#000',
					'base-100': '#111',
					info: '#93c5fd',
					success: '#4ade80',
					warning: '#fcd34d',
					error: '#fb7185',
				},
			},
		],
	},
	plugins: [require('daisyui')],
};
