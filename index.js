"use strict";

const kot = require("./lib/kot");
const mastodon = require("./lib/mastodon");
const twitter = require("./lib/twitter");

exports.run = async () => {
	const data = await kot.calculate();

	return Promise.all([
		mastodon.update(data),
		twitter.update(data),
	]);
};
