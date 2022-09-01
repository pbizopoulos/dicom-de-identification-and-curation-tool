'use strict';

const dateProcessingSelect = document.getElementById('dateProcessingSelect');
const dicomTagArray = Object.keys(dcmjs.data.DicomMetaDictionary.nameMap);
const dicomTagSavePathInputText = document.getElementById('dicomTagSavePathInputText');
const nemaTable = JSON.parse(nemaTableString);
const retainUidsInputCheckbox = document.getElementById('retainUidsInputCheckbox');
const saveDeidentifiedFilesAsZipButton = document.getElementById('saveDeidentifiedFilesAsZipButton');
const saveDeidentifiedPatientNamesButton = document.getElementById('saveDeidentifiedPatientNamesButton');
let dicomDictArray = [];
let fileArray = [];
let filesNum = 0;
let patientNameArray = [];

function disableUI(argument) {
	dateProcessingSelect.disabled = argument;
	dicomTagSavePathInputText.disabled = argument;
	retainUidsInputCheckbox.disabled = argument;
	saveDeidentifiedFilesAsZipButton.disabled = argument;
	saveDeidentifiedPatientNamesButton.disabled = argument;
}

function hashCode(str) {
	let hash = 0;
	for (let i = 0, len = str.length; i < len; i++) {
		let chr = str.charCodeAt(i);
		hash = (hash << 5) - hash + chr;
		hash |= 0;
	}
	return hash;
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

dicomTagSavePathInputText.onkeydown = function() {
	dicomTagSavePathInputText.setCustomValidity('');
}

dicomTagSavePathInputText.oninput = function() {
	const cursorPosition = dicomTagSavePathInputText.selectionStart - 1;
	const hasInvalidCharacters = dicomTagSavePathInputText.value.match(/[^0-9^A-E/]/);
	if (!hasInvalidCharacters) {
		return;
	}
	dicomTagSavePathInputText.value = dicomTagSavePathInputText.value.replace(/[^0-9^A-E/]/g, '');
	dicomTagSavePathInputText.setSelectionRange(cursorPosition, cursorPosition);
}

function readDeidentifyAndAddToZipFile(i, zip, regexpDate, numberOfDaysToAdd) {
	const reader = new FileReader();
	reader.onload = function() {
		dicomDictArray[i] = dcmjs.data.DicomMessage.readFile(reader.result);
		for (const property in nemaTable) {
			if (dicomDictArray[i].dict[property]) {
				if (nemaTable[property][3] === 'C') {
					let originalDate = dicomDictArray[i].dict[property].Value[0];
					if (originalDate !== '') {
						if (dateProcessingSelect.value === 'dateProcessingRandomShiftOption') {
							const validDate = regexpDate.test(originalDate);
							if (validDate) {
								originalDate = originalDate.replace(regexpDate, "$1-$2-$3");
								originalDate = new Date(originalDate);
								let unixDate = originalDate.setDate(originalDate.getDate() + numberOfDaysToAdd);
								let alteredDate = new Date(unixDate);
								let formattedDate = alteredDate.getUTCFullYear().toString() + (alteredDate.getMonth() + 1).toLocaleString('en-US', {minimumIntegerDigits: 2}) + (alteredDate.getDay() + 1).toLocaleString('en-US', {minimumIntegerDigits: 2});
								dicomDictArray[i].dict[property].Value = [formattedDate];
							}
							continue;
						}
						if (dateProcessingSelect.value === 'dateProcessingEmptyOption') {
							dicomDictArray[i].dict[property].Value = [];
						}
					}
					continue;
				}
				if (nemaTable[property][1] === 'K' && retainUidsInputCheckbox.checked) {
					continue;
				}
				dicomDictArray[i].dict[property].Value = [];
			}
		}
		const patientName = dicomDictArray[i].dict['00100010'].Value[0];
		if (!patientNameArray.includes(patientName)) {
			patientNameArray.push(patientName);
		}
		dicomDictArray[i].dict['00100010'].Value[0] = `Patient-${patientNameArray.indexOf(patientName)}`;
		let dicomTagValueSavePath = '';
		if (dicomTagSavePathInputText.value !== '') {
			const dicomTagSavePathArray = dicomTagSavePathInputText.value.slice(0, -1).split('/');
			for (const dicomTagSavePath of dicomTagSavePathArray) {
				if (!(dicomDictArray[i].dict[dicomTagSavePath])) {
					dicomTagSavePathInputText.setCustomValidity('invalid');
					return;
				} else if (!(dicomDictArray[i].dict[dicomTagSavePath].Value)){
					dicomTagSavePathInputText.setCustomValidity('invalid');
					return;
				} else if (!(dicomDictArray[i].dict[dicomTagSavePath].Value[0])){
					dicomTagSavePathInputText.setCustomValidity('invalid');
					return;
				}
			}
			dicomTagValueSavePath = dicomTagSavePathArray.map(x => dicomDictArray[i].dict[x].Value[0]).join('/') + '/';
		}
		const dicomTagValueSavePathArray = dicomTagValueSavePath.split('/');
		for (let j = dicomTagValueSavePathArray.length; j > 0; j--) {
			zip.file(dicomTagValueSavePathArray.slice(0, j).join('/') + '/', '', {date: new Date("January 02, 2000 00:00:00")});
		}
		let dateNow;
		if (navigator.webdriver) {
			dateNow = i;
		} else {
			dateNow = Date.now();
		}
		const fileName = `${dateNow}-${hashCode(JSON.stringify(dicomDictArray[i]))}`;
		zip.file(`${dicomTagValueSavePath}${fileName}.dcm`, dicomDictArray[i].write({allowInvalidVRLength: true}), {date: new Date("January 02, 2000 00:00:00")});
		if (i === filesNum - 1) {
			zip.generateAsync({type:'blob'})
				.then(function (blob) {
					saveData(blob, 'de-identified-files.zip');
				});
		}
	}
	reader.readAsArrayBuffer(fileArray[i]);
}

saveDeidentifiedFilesAsZipButton.onclick = function() {
	disableUI(true);
	const numberOfDaysToAdd = Math.floor((Math.random() - 0.5) * 200);
	const regexpDate = /(\d{4})(\d{2})(\d{2})/;
	const zip = new JSZip();
	for (let i = 0; i < filesNum; i++) {
		readDeidentifyAndAddToZipFile(i, zip, regexpDate, numberOfDaysToAdd);
	}
	disableUI(false);
}

saveDeidentifiedPatientNamesButton.onclick = function() {
	const csvContent = 'Patient name, Patient name (De-identified)\n' + patientNameArray.map((patientName, index) => `${patientName}, Patient-${index}`).join('\n') + '\n';
	const blob = new Blob([csvContent]);
	saveData(blob, 'de-identified-patient-names.csv');
}

disableUI(true);
