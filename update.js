"use strict";

const fetch = require("fetch-cookie")(require("node-fetch"));
const cheerio = require("cheerio");
const Twitter = require("twitter");
const Promise = require("bluebird");

const kot = require("./auth/kot.json");
const kotServer = "https://s3.kingtime.jp";

const client = Promise.promisifyAll(new Twitter(require("./auth/twitter.json")));

const states = ["🏠", "👨🏻‍💻"];
const clocks = [
	["🕛", "🕐", "🕑", "🕒", "🕓", "🕔", "🕕", "🕖", "🕗", "🕘", "🕙", "🕚"],
	["🕧", "🕜", "🕝", "🕞", "🕟", "🕠", "🕡", "🕢", "🕣", "🕤", "🕥", "🕦"],
];

(async () => {
	const login = await fetch(`${kotServer}/admin/?page_id=/login/login_form&action_id=1&login_id=${kot.id}&login_password=${kot.password}`);
	const $login = cheerio.load(await login.text());
	const [_, path] = $login("meta[http-equiv=refresh]").attr("content").split("URL=");

	const resp = await fetch(`${kotServer}${path}`);
	const $ = cheerio.load(await resp.text());

	let diff = 0;
	$(".htBlock-adjastableTableF td.all_work_time").each((_, elm) => {
		const val = parseFloat($(elm).text());
		if(!isNaN(val)){
			diff += val - 8.0;
		}
	});

	let hour, minute, count = 0;
	$(".htBlock-adjastableTableF td.start_end_timerecord").each((_, elm) => {
		const match = $(elm).text().match(/(\d\d):(\d\d)/);
		if(match){
			[_, hour, minute] = match;
			count++;
		}
	});

	hour = parseInt(hour) || 0;
	minute = parseInt(minute) || 0;

	if(count % 2){
		const now = new Date();
		diff = diff - 9.0 + (now.getHours() - hour) + (now.getMinutes() - minute) / 60;
	}
	diff = Math.round(diff * 100) / 100;

	const name = `${clocks[15 <= minute && minute < 45 ? 1 : 0][hour % 12]}${states[count % 2]} ${diff == 0 ? "±" : (diff > 0 ? "+" : "")}${diff}h`;
	await client.postAsync("account/update_profile", {name});
})();
