'use strict';

const dateProcessingSelect = document.getElementById('dateProcessingSelect');
const dicomTagArray = Object.keys(dcmjs.data.DicomMetaDictionary.nameMap);
const dicomTagSavePathInputText = document.getElementById('dicomTagSavePathInputText');
const numberOfFilesProcessedSpan = document.getElementById('numberOfFilesProcessedSpan');
const nemaTable = JSON.parse(nemaModifiedTableString);
const retainDescriptionsInputCheckbox = document.getElementById('retainDescriptionsInputCheckbox');
const retainUidsInputCheckbox = document.getElementById('retainUidsInputCheckbox');
const saveProcessedFilesAsZipButton = document.getElementById('saveProcessedFilesAsZipButton');
let dicomDictArray = [];
let fileArray = [];
let filesNum = 0;
let patientNameObject = {};

function disableUI(argument) {
	dateProcessingSelect.disabled = argument;
	retainDescriptionsInputCheckbox.disabled = argument;
	retainUidsInputCheckbox.disabled = argument;
	saveProcessedFilesAsZipButton.disabled = argument;
}

function hashCode(string) {
	const utf8 = new TextEncoder().encode(string);
	return crypto.subtle.digest('SHA-256', utf8).then((hashBuffer) => {
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		const hashHex = hashArray
			.map((bytes) => bytes.toString(16).padStart(2, '0'))
			.join('');
		return hashHex;
	});
}

function onloadDeidentiedPatientNamesInputFile() {
	const file = event.currentTarget.files[0];
	if (file.length === 0) {
		return;
	}
	const reader = new FileReader();
	reader.onload = function (e) {
		const text = e.target.result;
		const rowArray = text.split('\n');
		for (let i = 0; i < rowArray.length; i++) {
			const rowElementArray = rowArray[i].split(',');
			patientNameObject[rowElementArray[0]] = rowElementArray[1];
		}
	};
	reader.readAsText(file);
}

function onloadFilesOrDirectory() {
	fileArray = event.currentTarget.files;
	fileArray = [...fileArray].filter(file => file.type === 'application/dicom');
	filesNum = fileArray.length;
	if (filesNum === 0) {
		return;
	}
	disableUI(false);
}

function saveData(blob, fileName) {
	const a = document.createElement('a');
	document.body.appendChild(a);
	a.style = 'display: none';
	const url = window.URL.createObjectURL(blob);
	a.href = url;
	a.download = fileName;
	a.click();
	window.URL.revokeObjectURL(url);
}

saveProcessedFilesAsZipButton.onclick = function() {
	disableUI(true);
	const daysShiftNum = Math.floor((Math.random() - 0.5) * 200);
	const regexpDate = /(\d{4})(\d{2})(\d{2})/;
	const zip = new JSZip();
	for (let i = 0; i < filesNum; i++) {
		const reader = new FileReader();
		reader.onload = function() {
			dicomDictArray[i] = dcmjs.data.DicomMessage.readFile(reader.result);
			for (const property in nemaTable) {
				if (dicomDictArray[i].dict[property]) {
					if (nemaTable[property][3] === 'C') {
						let dateOriginal = dicomDictArray[i].dict[property].Value[0];
						if (dateProcessingSelect.value === 'dateProcessingRandomShiftOption') {
							if (regexpDate.test(dateOriginal)) {
								dateOriginal = dateOriginal.replace(regexpDate, "$1-$2-$3");
								dateOriginal = new Date(dateOriginal);
								const dateUnix = dateOriginal.setDate(dateOriginal.getDate() + daysShiftNum);
								const dateAltered = new Date(dateUnix);
								const dateFormatted = dateAltered.getUTCFullYear().toString() + (dateAltered.getMonth() + 1).toLocaleString('en-US', {minimumIntegerDigits: 2}) + (dateAltered.getDay() + 1).toLocaleString('en-US', {minimumIntegerDigits: 2});
								dicomDictArray[i].dict[property].Value = [dateFormatted];
							}
						} else if (dateProcessingSelect.value === 'dateProcessingEmptyOption') {
							dicomDictArray[i].dict[property].Value = [];
						}
					} else if (nemaTable[property][4] === 'X' && retainDescriptionsInputCheckbox.checked) {
						continue;
					} else if (nemaTable[property][1] === 'K' && retainUidsInputCheckbox.checked) {
						continue;
					} else if (property === '00100010') {
						const patientName = dicomDictArray[i].dict[property].Value[0];
						if (!(patientName in patientNameObject)) {
							patientNameObject[patientName] = `Patient-${Object.keys(patientNameObject).length}`;
						}
						dicomDictArray[i].dict[property].Value[0] = patientNameObject[patientName];
					} else {
						dicomDictArray[i].dict[property].Value = [];
					}
				}
				numberOfFilesProcessedSpan.textContent = `${i+1}/${filesNum}`;
			}
			hashCode(JSON.stringify(dicomDictArray[i])).then((hex) => {
				const dicomTagSavePathArray = dicomTagSavePathInputText.value.slice(0, -1).split('/');
				const dicomTagValueSavePath = dicomTagSavePathArray.map(x => dicomDictArray[i].dict[x].Value[0]).join('/') + '/';
				const dicomTagValueSavePathArray = dicomTagValueSavePath.split('/');
				for (let j = 1; j < dicomTagValueSavePathArray.length; j++) {
					zip.file(dicomTagValueSavePathArray.slice(0, j).join('/') + '/', '', {date: new Date("January 02, 2000 00:00:00")});
				}
				zip.file(`${dicomTagValueSavePath}${hex}.dcm`, dicomDictArray[i].write({allowInvalidVRLength: true}), {date: new Date("January 02, 2000 00:00:00")});
				if (i === filesNum - 1) {
					const csvContent = Object.entries(patientNameObject).map((patientName, index) => patientName).join('\n') + '\n';
					const blob = new Blob([csvContent]);
					zip.file('de-identified-patient-names.csv', blob, {date: new Date("January 02, 2000 00:00:00")});
					zip.generateAsync({type:'blob'})
						.then(function (blob) {
							saveData(blob, 'de-identified-files.zip');
							disableUI(false);
						});
				}
			})
		}
		reader.readAsArrayBuffer(fileArray[i]);
	}
}

disableUI(true);
