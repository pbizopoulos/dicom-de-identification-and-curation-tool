'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function waitFile (filename) {

	return new Promise(async (resolve, reject) => {
		if (!fs.existsSync(filename)) {
			await delay(3000);
			await waitFile(filename);
			resolve();
		} else {
			resolve();
		}

	})
}

function delay(time) {
	return new Promise(function(resolve) {
		setTimeout(resolve, time)
	});
}

(async () => {
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	const artifactsDir = 'artifacts';
	await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: path.resolve(artifactsDir)});
	for (let i = 1; i < 10; i++) {
		const inputDicomFileName = `N2D_000${i}.dcm`;
		if (!(fs.existsSync(`${artifactsDir}/${inputDicomFileName}`))) {
			await page.goto(`https://github.com/datalad/example-dicom-structural/blob/master/dicoms/${inputDicomFileName}`);
			await page.waitForSelector('#raw-url').then(selector => selector.click());
			await waitFile(`${artifactsDir}/${inputDicomFileName}`);
		}
	}
	await page.goto(`file:${path.join(__dirname, 'index.html')}`);
	await page.waitForSelector('#loadFilesInputFile:not([disabled])');
	const inputUploadHandle = await page.$('#loadFilesInputFile');
	const dicomFileNameArray = fs.readdirSync(artifactsDir).filter(fn => fn.endsWith('.dcm')).filter(fn => fn.startsWith('N2D_'));
	const dicomFilePathArray = dicomFileNameArray.map(file => `${artifactsDir}/${file}`);
	inputUploadHandle.uploadFile(...dicomFilePathArray);
	await page.waitForSelector('#fileIndexCurrentInputRange:not([disabled])');
	await page.evaluate(() => {
		document.querySelector('#fileIndexCurrentInputRange').value = 3;
		document.querySelector('#fileIndexCurrentInputRange').oninput();
	});
	await page.waitForSelector('#showEmptyOriginalTagsInputCheckbox').then(selector => selector.click());
	await page.waitForSelector('#showEmptyOriginalTagsInputCheckbox').then(selector => selector.click());
	await page.waitForXPath('/html/body/table/tbody/tr[65]/td[4]').then(selector => selector.click());
	await page.keyboard.type('20220101');
	await page.waitForXPath('/html/body/table/tbody/tr[65]/td[5]').then(selector => selector.click());
	await page.evaluate(() => {
		document.querySelector('#fileIndexCurrentInputRange').value = 0;
		document.querySelector('#fileIndexCurrentInputRange').oninput();
	});
	await page.waitForSelector('#saveDeidentifiedFilesButton').then(selector => selector.click());
	await waitFile(`${artifactsDir}/file-0.dcm`);
	const dicomBuffer = new fs.readFileSync(`${artifactsDir}/file-0.dcm`);
	const dicomHash = crypto.createHash('sha256').update(dicomBuffer).digest('hex');
	assert(dicomHash === '5f8f0161378e2c1456c3a56ba7abecf3e023c42d0431f3862837fb8b1df37014');
	await page.screenshot({
		path: `${artifactsDir}/puppeteer-screenshot.png`
	});
	const screenshotBuffer = new fs.readFileSync(`${artifactsDir}/puppeteer-screenshot.png`);
	const screenshotHash = crypto.createHash('sha256').update(screenshotBuffer).digest('hex');
	assert(screenshotHash === '75226f739b75d2633c9bc29ee2e0c5a221d08d92df1ee8fe75acae84079f8c30');
	await page.close();
	await browser.close();
})();
