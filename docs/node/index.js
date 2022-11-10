'use strict';
const fs = require('fs');
const puppeteer = require('puppeteer');
(async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
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
			const dicomTag = outputArray[i][1].slice(1, 10).replace(',', '');
			if (outputArray[i][9] === 'C') {
				outputArray[i][9] = 'K';
			}
			if (outputArray[i][12] === 'C') {
				outputArray[i][12] = 'K';
			}
			outputArray[i][4] = 'X';
			outputObject[dicomTag] = [outputArray[i][4], outputArray[i][6], outputArray[i][9], outputArray[i][11], outputArray[i][12]];
		}
		outputObject['00100010'][0] = 'Z';
		outputObject['00100020'][0] = 'Z';
		return outputObject;
	});
	fs.writeFileSync('dist/nema-modified-table.js', `const nemaModifiedTableString = '${JSON.stringify(nemaModifiedTableObject)}';`);
	let nemaModifiedTableDefaultCsv = 'Tag,Action\n';
	for (const property in nemaModifiedTableObject) {
		if (nemaModifiedTableObject[property].includes('C')) {
			nemaModifiedTableDefaultCsv += `${property},C\n`;
		} else if (!(nemaModifiedTableObject[property].includes('K'))) {
			nemaModifiedTableDefaultCsv += `${property},X\n`;
		}
	}
	fs.writeFileSync('bin/nema-modified-table-default.csv', nemaModifiedTableDefaultCsv);
	await page.close();
	await browser.close();
})();
