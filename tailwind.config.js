/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./apps/dashboard/src/**/*.{html,ts}',

		'node_modules/daisyui/dist/**/*.js',
		'node_modules/react-daisyui/dist/**/*.js',
	],
	theme: {
		extend: {
			colors: {
				'base-0': '#090909',
			},
			rounded: {
				'2xl': '2rem',
			},
		},
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
