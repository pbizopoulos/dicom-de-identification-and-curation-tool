'use strict';

const assert = require('assert');
const crypto = require('crypto');
const dcmjs = require('dcmjs');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

function waitFile(fileName) {
	while (!fs.existsSync(fileName)) {
		continue;
	}
}

(async () => {
	const jsonDataset = `{
		"AccessionNumber": "",
			"AcquisitionMatrix": [ 256, 0, 0, 192 ],
			"AcquisitionNumber": "8",
			"BitsAllocated": 16,
			"BitsStored": 16,
			"Columns": 256,
			"ContentDate": "20020628",
			"ContentTime": "164936.0",
			"ContrastBolusAgent": "",
			"DeviceSerialNumber": "4168496325",
			"EchoTime": "6",
			"EchoTrainLength": "1",
			"FlipAngle": "3",
			"FrameOfReferenceUID": "2.16.840.1.113662.4.4168496325.1025305873.7118351817185979330",
			"HighBit": 15,
			"ImageOrientationPatient": [ "0.00000e+00", "1.00000e+00", "-0.00000e+00", "-0.00000e+00", "0.00000e+00", "-1.00000e+00" ],
			"ImagePositionPatient": [ "6.454490e+01", "-1.339286e+02", "1.167857e+02" ],
			"ImageType": [ "ORIGINAL", "PRIMARY", "OTHER" ],
			"ImagesInAcquisition": "130",
			"ImagingFrequency": "6.37165e+01",
			"InstanceNumber": "18",
			"InstitutionName": "UCI Medical Center",
			"MRAcquisitionType": "",
			"MagneticFieldStrength": "1.5",
			"Manufacturer": "Marconi Medical Systems, Inc.",
			"ManufacturerModelName": "Eclipse 1.5T",
			"Modality": "MR",
			"NumberOfAverages": "1",
			"NumberOfTemporalPositions": "1",
			"OperatorsName": "SSRT/^^^^",
			"PatientAge": "039Y",
			"PatientBirthDate": "19000000",
			"PatientID": "0000000",
			"PatientName": "Zzzzzz^Yyyyy^^^",
			"PatientPosition": "HFS",
			"PatientSex": "M",
			"PatientWeight": "99.773300",
			"PercentPhaseFieldOfView": "91.4062",
			"PhotometricInterpretation": "MONOCHROME2",
			"PixelRepresentation": 1,
			"PixelSpacing": [ "1.000000e+00", "1.000000e+00" ],
			"PositionReferenceIndicator": "BRAIN",
			"ProtocolName": "SAG/RF-FAST/VOL/FLIP 3",
			"ReceiveCoilName": "HEAD",
			"ReferencedImageSequence": {
				"ReferencedSOPClassUID": "1.2.840.10008.5.1.4.1.1.4",
				"ReferencedSOPInstanceUID": "2.16.840.1.113662.4.4168496325.1025306066.995213515550827262",
				"_vrMap": {}
			},
			"ReferringPhysicianName": "",
			"RepetitionTime": "20",
			"Rows": 256,
			"SOPClassUID": "1.2.840.10008.5.1.4.1.1.4",
			"SOPInstanceUID": "2.16.840.1.113662.4.4168496325.1025307679.1207625440068523197",
			"SamplesPerPixel": 1,
			"ScanOptions": "",
			"ScanningSequence": "GR",
			"SequenceVariant": [
				"SS",
				"SP"
			],
			"SeriesDate": "20020628",
			"SeriesDescription": "SAG/RF-FAST/VOL/FLIP 3",
			"SeriesInstanceUID": "2.16.840.1.113662.4.4168496325.1025307678.3494705239865384161",
			"SeriesNumber": "5",
			"SeriesTime": "164118.0",
			"SliceLocation": "64.544899",
			"SliceThickness": "1.300000e+00",
			"SoftwareVersions": "VIA2.0E.003",
			"SpecificCharacterSet": "ISO_IR 100",
			"StationName": "ba187_ws",
			"StudyDate": "20020628",
			"StudyDescription": "BRAIN",
			"StudyID": "14024",
			"StudyInstanceUID": "2.16.840.1.113662.4.4168496325.1025305873.7118351817185979330",
			"StudyTime": "160956.0",
			"TemporalPositionIdentifier": "1",
			"TemporalResolution": "458660",
			"WindowCenter": "28",
			"WindowWidth": "20",
			"_meta": {
				"FileMetaInformationVersion": {
					"Value": [
						{
							"0": 0,
							"1": 1
						}
					],
					"vr": "OB"
				},
				"ImplementationClassUID": {
					"Value": [
						"1.2.840.113819.7.1.1997.1.0"
					],
					"vr": "UI"
				},
				"ImplementationVersionName": {
					"Value": [
						"SENSORSYSTEMS1.0"
					],
					"vr": "SH"
				},
				"MediaStorageSOPClassUID": {
					"Value": [
						"1.2.840.10008.5.1.4.1.1.4"
					],
					"vr": "UI"
				},
				"MediaStorageSOPInstanceUID": {
					"Value": [
						"2.16.840.1.113662.4.4168496325.1025307679.1207625440068523197"
					],
					"vr": "UI"
				},
				"TransferSyntaxUID": {
					"Value": [
						"1.2.840.10008.1.2"
					],
					"vr": "UI"
				}
			},
			"_vrMap": {
				"PixelData": "OW"
			}
	}`;

	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	const artifactsDir = process.env.ARTIFACTS_DIR;
	await page._client().send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: path.resolve(artifactsDir)});
	for (let i = 0; i < 100; i++) {
		let inputDicomFileName = `file-name-${i}.dcm`;
		if (i % 7 != 0) {
			const newPath = `file-path-${i % 7}`;
			inputDicomFileName = `${newPath}/${inputDicomFileName}`;
			if (!fs.existsSync(`${artifactsDir}/${newPath}`)){
				fs.mkdirSync(`${artifactsDir}/${newPath}`);
			}
		}
		if (!(fs.existsSync(`${artifactsDir}/${inputDicomFileName}`))) {
			let dataset = JSON.parse(jsonDataset);
			dataset.PatientName = `John Doe ${i % 100}`;
			dataset.SeriesNumber = i % 5;
			if (i % 3 === 0) {
				dataset.Modality = 'CT';
			} else if (i % 3 === 1) {
				dataset.Modality = 'MG';
			} else if (i % 3 === 2) {
				dataset.Modality = 'MR';
			}
			let pixelData = new Int16Array(dataset.Rows * dataset.Columns);
			pixelData.fill(100);
			dataset.PixelData = pixelData.buffer;
			const dicomDict = dcmjs.data.datasetToDict(dataset);
			const buffer = Buffer.from(dicomDict.write());
			fs.writeFileSync(`${artifactsDir}/${inputDicomFileName}`, buffer);
		}
	}
	await page.goto(`file:${path.join(__dirname, 'index.html')}`);
	await page.waitForSelector('#loadFilesInputFile:not([disabled])');
	const inputUploadHandle = await page.$('#loadFilesInputFile');
	let dicomFileNameArray = fs.readdirSync(artifactsDir).filter(fn => fn.endsWith('.dcm')).filter(fn => fn.startsWith('file-name'));
	let dicomFilePathArray = dicomFileNameArray.map(file => `${artifactsDir}/${file}`);
	inputUploadHandle.uploadFile(...dicomFilePathArray);
	if (fs.existsSync(`${artifactsDir}/de-identified-files.zip`)) {
		await fs.unlinkSync(`${artifactsDir}/de-identified-files.zip`);
	}
	await page.waitForSelector('#saveProcessedFilesAsZipButton').then(selector => selector.click());
	waitFile(`${artifactsDir}/de-identified-files.zip`);
	const zipFileBuffer = new fs.readFileSync(`${artifactsDir}/de-identified-files.zip`);
	const zipFileHash = crypto.createHash('sha256').update(zipFileBuffer).digest('hex');
	assert.strictEqual(zipFileHash, '1fdd6a54f2623a56ad891ffbefe2ae22e698c518f8e9c815a9fa9e1da81f4573');
	await page.screenshot({
		path: `${artifactsDir}/puppeteer-screenshot.png`
	});
	const screenshotBuffer = new fs.readFileSync(`${artifactsDir}/puppeteer-screenshot.png`);
	const screenshotHash = crypto.createHash('sha256').update(screenshotBuffer).digest('hex');
	if (process.env.GITHUB_ACTIONS === undefined) {
		assert.strictEqual(screenshotHash, '64dd88b7d6c8f78e9230f86fe1507ee698d7542d17e5802ded571f6aab67e572');
	}
	await page.close();
	await browser.close();
})();
