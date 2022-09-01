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
	if (fs.existsSync(`${artifactsDir}/de-identified-files.zip`)) {
		await fs.unlinkSync(`${artifactsDir}/de-identified-files.zip`);
	}
	await page.waitForSelector('#saveDeidentifiedFilesAsZipButton').then(selector => selector.click());
	waitFile(`${artifactsDir}/de-identified-files.zip`);
	const zipFileBuffer = new fs.readFileSync(`${artifactsDir}/de-identified-files.zip`);
	const zipFileHash = crypto.createHash('sha256').update(zipFileBuffer).digest('hex');
	assert.strictEqual(zipFileHash, 'a5ceb7b4ecb02f435fee19086ddc3ca1a184ebf9696fe7aae234375a15625d3c');
	await page.waitForSelector('#saveDeidentifiedPatientNamesButton').then(selector => selector.click());
	waitFile(`${artifactsDir}/de-identified-patient-names.csv`);
	const deIdentifiedPatientNamesBuffer = new fs.readFileSync(`${artifactsDir}/de-identified-patient-names.csv`);
	const deIdentifiedPatientNamesHash = crypto.createHash('sha256').update(deIdentifiedPatientNamesBuffer).digest('hex');
	assert.strictEqual(deIdentifiedPatientNamesHash, '26c93101ae6f2ab670a97f1408b10933bb3e5867a9186d712dc8910271e85ac9');
	await page.screenshot({
		path: `${artifactsDir}/puppeteer-screenshot.png`
	});
	const screenshotBuffer = new fs.readFileSync(`${artifactsDir}/puppeteer-screenshot.png`);
	const screenshotHash = crypto.createHash('sha256').update(screenshotBuffer).digest('hex');
	if (process.env.GITHUB_ACTIONS === undefined) {
		assert.strictEqual(screenshotHash, '675619f23182e41fa450aee75375e124766c273a77d4ee34577e111b438cc470');
	}
	await page.close();
	await browser.close();
})();
