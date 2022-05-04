'use strict';

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	await page.goto(`file:${path.join(__dirname, '../index.html')}`);
	await page.waitForSelector('#loadFilesInputFile:not([disabled])');
	const inputUploadHandle = await page.$('#loadFilesInputFile');
	const dicomDir = 'artifacts/DICOM/';
	const dicomFileNameArray = fs.readdirSync(dicomDir);
	const dicomFilePathArray = dicomFileNameArray.map(file => `${dicomDir}${file}`);
	inputUploadHandle.uploadFile(...dicomFilePathArray);
	await page.waitForSelector('#fileCurrentIndexInputRange:not([disabled])');
	await page.evaluate(() => {
		document.querySelector('#fileCurrentIndexInputRange').value = 42;
		document.querySelector('#fileCurrentIndexInputRange').oninput();
	});
	await page.waitForSelector('#showEmptyOriginalTagsInputCheckbox').then(selector => selector.click());
	await page.waitForSelector('#showEmptyOriginalTagsInputCheckbox').then(selector => selector.click());
	await page.waitForXPath('/html/body/table/tbody/tr[57]/td[4]').then(selector => selector.click());
	await page.keyboard.type('20220101');
	await page.waitForXPath('/html/body/table/tbody/tr[57]/td[5]').then(selector => selector.click());
	await page.evaluate(() => {
		document.querySelector('#fileCurrentIndexInputRange').value = 150;
		document.querySelector('#fileCurrentIndexInputRange').oninput();
	});
	await page.waitForSelector('#showEmptyOriginalTagsInputCheckbox').then(selector => selector.click());
	await page.waitForSelector('#showEmptyOriginalTagsInputCheckbox').then(selector => selector.click());
	await page.screenshot({
		path: 'artifacts/puppeteer-screenshot.png'
	});
	await page.close();
	await browser.close();
})();
