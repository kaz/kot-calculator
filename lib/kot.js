"use strict";

const moment = require("moment-timezone");
const fetch = require("fetch-cookie")(require("node-fetch"));
const cheerio = require("cheerio");

const kotServer = "https://s3.kingtime.jp";

const states = ["🏠", "👨🏻‍💻"];
const clocks = [
	["🕛", "🕐", "🕑", "🕒", "🕓", "🕔", "🕕", "🕖", "🕗", "🕘", "🕙", "🕚"],
	["🕧", "🕜", "🕝", "🕞", "🕟", "🕠", "🕡", "🕢", "🕣", "🕤", "🕥", "🕦"],
];

exports.calculate = async () => {
	const {id, password} = require("../credentials/kot.json");

	const login = await fetch(`${kotServer}/admin/?page_id=/login/login_form&action_id=1&login_id=${id}&login_password=${password}`);
	const $login = cheerio.load(await login.text());
	const [, path] = $login("meta[http-equiv=refresh]").attr("content").split("URL=");

	const resp = await fetch(`${kotServer}${path}`);
	const $ = cheerio.load(await resp.text());

	let diff = 0;
	$(".htBlock-adjastableTableF td.all_work_time").each((_, elm) => {
		const val = parseFloat($(elm).text());
		if(!isNaN(val)){
			diff += val - 8.0;
		}
	});

	let hour; let minute; let count = 0;
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
		const now = moment().tz("Asia/Tokyo");
		diff = diff - 9.0 + (now.hours() - hour) + (now.minutes() - minute) / 60;
	}
	diff = Math.round(diff * 100) / 100;

	const data = `${clocks[15 <= minute && minute < 45 ? 1 : 0][hour % 12]}${states[count % 2]} ${diff == 0 ? "±" : (diff > 0 ? "+" : "")}${diff}h`;

	console.log("kot:", data);
	return data;
};
