"use strict";

const puppeteer = require("puppeteer");
const Twitter = require("twitter");
const Promise = require("bluebird");

const client = Promise.promisifyAll(new Twitter(require("./auth.json")));

const states = ["🏠", "👨🏻‍💻"];
const clocks = [
	["🕛", "🕐", "🕑", "🕒", "🕓", "🕔", "🕕", "🕖", "🕗", "🕘", "🕙", "🕚"],
	["🕧", "🕜", "🕝", "🕞", "🕟", "🕠", "🕡", "🕢", "🕣", "🕤", "🕥", "🕦"],
];

(async () => {
	const browser = await puppeteer.launch({args: ["--no-sandbox"]});

	const page = await browser.newPage();
	await page.goto("https://s3.kingtime.jp/admin/");
	await page.type("#login_id", "DUMMY_ID");
	await page.type("#login_password", "DUMMY_PASSWORD");
	await page.click("#login_button");
	await page.waitForSelector("#footer_main_menu");

	let {diff, hour, minute, count} = await page.evaluate(() => {
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

		return {diff, hour, minute, count};
	});
	await browser.close();

	hour = parseInt(hour);
	minute = parseInt(minute);

	if(count % 2){
		const now = new Date();
		diff = diff - 9.0 + (now.getHours() - hour) + (now.getMinutes() - minute) / 60;
	}
	diff = Math.round(diff * 100) / 100;

	const name = `${clocks[15 <= minute && minute < 45 ? 1 : 0][hour % 12]}${states[count % 2]} ${diff == 0 ? "±" : (diff > 0 ? "+" : "")}${diff}h`;
	await client.postAsync("account/update_profile", {name});
})();
