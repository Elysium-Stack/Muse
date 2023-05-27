module.exports = function (handlebars) {
	// Adding a custom handlebars helper: loud
	handlebars.registerHelper('isDJS', function (aString) {
		return (
			!aString.toLowerCase().endsWith('dto') &&
			!aString.toLowerCase().endsWith('entity')
		);
	});
};
