'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	const downloadPath = path.resolve('artifacts');
	await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: downloadPath});
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
	await page.waitForSelector('#saveDeidentifiedFilesButton').then(selector => selector.click());
	const dicomBuffer = new fs.readFileSync('artifacts/file-0.dcm');
	const dicomHash = crypto.createHash('sha256').update(dicomBuffer).digest('hex');
	assert(dicomHash === '3c176eef09d75cc906fe0676cbdd81d27619f4945f17ddd77e13a12c5a03154f');
	await page.screenshot({
		path: 'artifacts/puppeteer-screenshot.png'
	});
	const screenshotBuffer = new fs.readFileSync('artifacts/puppeteer-screenshot.png');
	const screenshotHash = crypto.createHash('sha256').update(screenshotBuffer).digest('hex');
	assert(screenshotHash === '15ee59132bcdb318a542cac693d9be3d3315090f84b186e2f9fe8dd7928375f6');
	await page.close();
	await browser.close();
})();
