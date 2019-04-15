"use strict";

const puppeteer = require("puppeteer");
const Twitter = require("twitter");
const Promise = require("bluebird");

const client = Promise.promisifyAll(new Twitter(require("./auth.json")));

const states = ["🏠", "👨🏻‍💻"];
const clocks = [
	["🕛", "🕧"],
	["🕐", "🕜"],
	["🕑", "🕝"],
	["🕒", "🕞"],
	["🕓", "🕟"],
	["🕔", "🕠"],
	["🕕", "🕡"],
	["🕖", "🕢"],
	["🕗", "🕣"],
	["🕘", "🕤"],
	["🕙", "🕥"],
	["🕚", "🕦"],
];

(async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto("https://s3.kingtime.jp/admin/");
	await page.type("#login_id", "DUMMY_ID");
	await page.type("#login_password", "DUMMY_PASSWORD");
	await page.click("#login_button");
	await page.waitForSelector("#footer_main_menu");

	const {diff, hour, minute, count} = await page.evaluate(() => {
		let diff = 0;
		$(".htBlock-adjastableTableF td.all_work_time").each((_, elm) => {
			const val = parseFloat($(elm).text());
			if(!isNaN(val)){
				diff += val - 8.0;
			}
		});
		diff = Math.round(diff * 100) / 100;

		const $records = $(".htBlock-adjastableTableF td.start_end_timerecord");
		let hour, minute, count = $records.size();
		$records.each((_, elm) => {
			const match = $(elm).text().match(/(\d\d):(\d\d)/);
			if(match){
				[_, hour, minute] = match;
			}
		});
		hour = parseInt(hour);
		minute = parseInt(minute);

		return {diff, hour, minute, count};
	});

	await browser.close();

	const name = `${states[count % 2]}${clocks[hour % 12][Math.floor(minute / 30)]} ${diff == 0 ? "±" : (diff > 0 ? "+" : "-")}${diff}h`;
	await client.postAsync("account/update_profile", {name});
})();
