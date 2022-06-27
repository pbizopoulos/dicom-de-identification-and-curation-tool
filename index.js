'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');


async function waitFile(filename) {
	return new Promise(async (resolve, reject) => {
		if (!fs.existsSync(filename)) {
			await delay(1000);
			await waitFile(filename);
		}
		resolve();
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
	const artifactsDir = process.env.ARTIFACTS_DIR;
	await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: path.resolve(artifactsDir)});
	for (let i = 0; i < 9; i++) {
		const inputDicomFileName = `N2D_000${i+1}.dcm`;
		if (!(fs.existsSync(`${artifactsDir}/${inputDicomFileName}`))) {
			await page.goto(`https://github.com/datalad/example-dicom-structural/blob/master/dicoms/${inputDicomFileName}`);
			await page.waitForSelector('#raw-url').then(selector => selector.click());
			await waitFile(`${artifactsDir}/${inputDicomFileName}`);
		}
	}
	await page.goto(`file:${path.join(__dirname, 'index.html')}`);
	await page.waitForSelector('#loadFilesInputFile:not([disabled])');
	const inputUploadHandle = await page.$('#loadFilesInputFile');
	let dicomFileNameArray = fs.readdirSync(artifactsDir).filter(fn => fn.endsWith('.dcm')).filter(fn => fn.startsWith('N2D_'));
	let dicomFilePathArray = dicomFileNameArray.map(file => `${artifactsDir}/${file}`);
	inputUploadHandle.uploadFile(...dicomFilePathArray);
	await page.waitForSelector('#fileIndexCurrentInputRange:not([disabled])');
	await page.evaluate(() => {
		document.querySelector('#fileIndexCurrentInputRange').value = 3;
		document.querySelector('#fileIndexCurrentInputRange').oninput();
	});
	await page.waitForSelector('#showEmptyOriginalTagsInputCheckbox').then(selector => selector.click());
	await page.waitForSelector('#showEmptyOriginalTagsInputCheckbox').then(selector => selector.click());
	await page.waitForXPath('/html/body/div[3]/table/tbody/tr[65]/td[3]').then(selector => selector.click());
	await page.keyboard.type('20220101');
	await page.waitForXPath('/html/body/div[3]/table/tbody/tr[65]/td[4]').then(selector => selector.click());
	await page.evaluate(() => {
		document.querySelector('#fileIndexCurrentInputRange').value = 0;
		document.querySelector('#fileIndexCurrentInputRange').oninput();
	});
	await page.waitForXPath('/html/body/div[3]/table/tbody/tr[65]/td[3]').then(selector => selector.click());
	await page.keyboard.press('Backspace');
	await page.keyboard.type('2');
	if (fs.existsSync(`${artifactsDir}/files.zip`)) {
		await fs.unlinkSync(`${artifactsDir}/files.zip`);
	}
	await page.waitForSelector('#saveDeidentifiedFilesButton').then(selector => selector.click());
	await waitFile(`${artifactsDir}/files.zip`);
	const zipFileBuffer = new fs.readFileSync(`${artifactsDir}/files.zip`);
	const zipFileHash = crypto.createHash('sha256').update(zipFileBuffer).digest('hex');
	assert(zipFileHash === '4735ddf804b366e692b2c2e48274401f01ae8fe69fef37679b514bb2034377d4');
	await page.screenshot({
		path: `${artifactsDir}/puppeteer-screenshot.png`
	});
	const screenshotBuffer = new fs.readFileSync(`${artifactsDir}/puppeteer-screenshot.png`);
	const screenshotHash = crypto.createHash('sha256').update(screenshotBuffer).digest('hex');
	if (process.env.GITHUB_ACTIONS === undefined) {
		assert(screenshotHash === 'b994259014c98523f643c7b9b9643651b15c3fc1f6a9d7a37ed07726f833e7c7');
	}
	await page.close();
	await browser.close();
})();
