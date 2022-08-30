'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

function waitFile(fileName) {
	while (!fs.existsSync(fileName)) {
		continue;
	}
}

(async () => {
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	const artifactsDir = process.env.ARTIFACTS_DIR;
	await page._client().send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: path.resolve(artifactsDir)});
	for (let i = 0; i < 9; i++) {
		const inputDicomFileName = `N2D_000${i+1}.dcm`;
		if (!(fs.existsSync(`${artifactsDir}/${inputDicomFileName}`))) {
			await page.goto(`https://github.com/datalad/example-dicom-structural/blob/master/dicoms/${inputDicomFileName}`);
			await page.waitForSelector('#raw-url').then(selector => selector.click());
			waitFile(`${artifactsDir}/${inputDicomFileName}`);
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
	await page.waitForSelector('#exportDeidentifiedFilesButton').then(selector => selector.click());
	waitFile(`${artifactsDir}/files.zip`);
	const zipFileBuffer = new fs.readFileSync(`${artifactsDir}/files.zip`);
	const zipFileHash = crypto.createHash('sha256').update(zipFileBuffer).digest('hex');
	assert.strictEqual(zipFileHash, '535d6fc7ceb0f764a1c76fcaf920f043448656aa47f175121c75710d90bbb6cb');
	await page.waitForSelector('#exportDeidentifiedPatientNamesButton').then(selector => selector.click());
	waitFile(`${artifactsDir}/de-identified-patient-names.csv`);
	const deIdentifiedPatientNamesBuffer = new fs.readFileSync(`${artifactsDir}/de-identified-patient-names.csv`);
	const deIdentifiedPatientNamesHash = crypto.createHash('sha256').update(deIdentifiedPatientNamesBuffer).digest('hex');
	assert.strictEqual(deIdentifiedPatientNamesHash, '7b7d181d2d194a9ab66d3c2f5642ea0cb60e44e7b71b4941da0b537d698c9c53');
	await page.screenshot({
		path: `${artifactsDir}/puppeteer-screenshot.png`
	});
	const screenshotBuffer = new fs.readFileSync(`${artifactsDir}/puppeteer-screenshot.png`);
	const screenshotHash = crypto.createHash('sha256').update(screenshotBuffer).digest('hex');
	if (process.env.GITHUB_ACTIONS === undefined) {
		assert.strictEqual(screenshotHash, '1b736ee5ec99da808e07f55a083de0cee641b54426ee6cf906c974628ff6de77');
	}
	await page.close();
	await browser.close();
})();
