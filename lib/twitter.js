"use strict";

const util = require("util");
const Twitter = require("twitter");

exports.update = async data => {
	const credentials = (() => {
		try {
			return require("../credentials/twitter.json");
		} catch(e) {
			return null;
		}
	})();

	if(!credentials){
		console.log("twitter: credentials not found. skipped.");
		return;
	}

	const client = new Twitter(credentials);
	await util.promisify(client.post).bind(client)("account/update_profile", {name: data});

	console.log("twitter: updated");
};
