"use strict";

const kot = require("./lib/kot");
const twitter = require("./lib/twitter");

exports.run = async () => {
	const data = await kot.calculate();

	return Promise.all([
		twitter.update(data),
	]);
};
