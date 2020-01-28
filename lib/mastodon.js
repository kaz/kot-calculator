"use strict";

const {Masto} = require("masto");

exports.update = async data => {
	const credentials = (() => {
		try {
			return require("../credentials/mastodon.json");
		} catch(e) {
			return null;
		}
	})();

	if(!credentials){
		console.log("mastodon: credentials not found. skipped.");
		return;
	}

	const client = await Masto.login(credentials);
	await client.updateCredentials({fields_attributes: [{name: "勤怠", value: data}]});

	console.log("mastodon: updated");
};
