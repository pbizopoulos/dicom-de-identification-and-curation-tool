'use strict';

const fs = require('fs');
const puppeteer = require('puppeteer');


(async () => {
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	const artifactsDir = process.env.ARTIFACTS_DIR;
	await page.goto('https://dicom.nema.org/medical/dicom/current/output/chtml/part15/chapter_e.html');
	const nemaModifiedTableObject = await page.evaluate(() => {
		const rows = document.getElementsByTagName('table')[3].rows;
		let outputArray = Array.from(rows, row => {
			const columns = row.querySelectorAll('td');
			return Array.from(columns, column => column.innerText);
		});
		outputArray = outputArray.slice(1);
		let outputObject = {};
		for (let i = 0; i < outputArray.length; i++) {
			dicomTag = outputArray[i][1].slice(1, 10).replace(',', '');
			if (outputArray[i][12] === 'C') {
				outputArray[i][12] = 'X';
			}
			if (dicomTag !== '00100010') {
				outputArray[i][4] = 'X';
			}
			outputObject[dicomTag] = [outputArray[i][4], outputArray[i][6], outputArray[i][10], outputArray[i][11], outputArray[i][12]];
		}
		return outputObject;
	});
	fs.writeFileSync('release/nema-modified-table.js', `const nemaModifiedTableString = \'${JSON.stringify(nemaModifiedTableObject)}\';`);
	const basicProfileCsv = 'Tag,Basic Prof.,Rtn. UIDs Opt.,Rtn. Long. Full Dates Opt.,Rtn. Long. Modif. Dates Opt.,Clean Desc. Opt.\n' + Object.entries(nemaModifiedTableObject).map((patientName) => patientName).join('\n') + '\n';

	fs.writeFileSync('artifacts/basic-profile.csv', basicProfileCsv);
	await page.close();
	await browser.close();
})();
