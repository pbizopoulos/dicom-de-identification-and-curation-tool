'use strict';

const applyDeidentificationProfileInputCheckbox = document.getElementById('applyDeidentificationProfileInputCheckbox');
const dateProcessingSelect = document.getElementById('dateProcessingSelect');
const dicomTagArray = Object.keys(dcmjs.data.DicomMetaDictionary.nameMap);
const dicomTagExportPathInputText = document.getElementById('dicomTagExportPathInputText');
const exportDeidentifiedFilesButton = document.getElementById('exportDeidentifiedFilesButton');
const exportDeidentifiedPatientNamesButton = document.getElementById('exportDeidentifiedPatientNamesButton');
const fileIndexCurrentInputRange = document.getElementById('fileIndexCurrentInputRange');
const fileIndexCurrentSpan = document.getElementById('fileIndexCurrentSpan');
const keepPrivateAttributesInputCheckbox = document.getElementById('keepPrivateAttributesInputCheckbox');
const keepUIDsInputCheckbox = document.getElementById('keepUIDsInputCheckbox');
const nemaTable = JSON.parse(nemaTableString);
const replaceFileNameWithRandomInputCheckbox = document.getElementById('replaceFileNameWithRandomInputCheckbox');
const replacePatientNameWithFileIndexInputCheckbox = document.getElementById('replacePatientNameWithFileIndexInputCheckbox');
const showEmptyOriginalTagsInputCheckbox = document.getElementById('showEmptyOriginalTagsInputCheckbox');
let datasetAfterAnonymizationArray = [];
let datasetBeforeAnonymizationArray = [];
let dicomDictArray = [];
let fileIndexCurrent = 0;
let files = [];
let filesNum = 0;
let patientNameArray = [];

function applyDeidentification() {
	const numberOfDaysToAdd = Math.floor((Math.random() - 0.5) * 200);
	const regexpDate = /(\d{4})(\d{2})(\d{2})/;
	for (let i = 0; i < filesNum; i++) {
		const reader = new FileReader();
		reader.onload = function() {
			dicomDictArray[i] = dcmjs.data.DicomMessage.readFile(reader.result);
			datasetBeforeAnonymizationArray[i] = dcmjs.data.DicomMetaDictionary.naturalizeDataset(dicomDictArray[i].dict);
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
					if (parseInt(property.slice(0, 4)) % 2) {
						if (keepPrivateAttributesInputCheckbox.checked) {
							continue;
						} else {
							dicomDictArray[i].dict[property].Value = [];
						}
					}
					if (nemaTable[property][1] === 'K') {
						if (keepUIDsInputCheckbox.checked) {
							continue;
						} else {
							dicomDictArray[i].dict[property].Value = [];
						}
					}
					if (applyDeidentificationProfileInputCheckbox.checked) {
						dicomDictArray[i].dict[property].Value = [];
					}
				}
			}
			const patientName = dicomDictArray[i].dict['00100010'].Value[0];
			if (!patientNameArray.includes(patientName)) {
				patientNameArray.push(patientName);
			}
			if (replacePatientNameWithFileIndexInputCheckbox.checked) {
				dicomDictArray[i].dict['00100010'].Value[0] = `Patient-${patientNameArray.indexOf(patientName)}`;
			}
			datasetAfterAnonymizationArray[i] = dcmjs.data.DicomMetaDictionary.naturalizeDataset(dicomDictArray[i].dict);
			if (i === filesNum - 1) {
				fileIndexCurrentInputRange.oninput();
				showEmptyOriginalTagsInputCheckbox.onclick();
				disableUI(false);
			}
		}
		reader.readAsArrayBuffer(files[i]);
	}
}

function disableUI(argument) {
	applyDeidentificationProfileInputCheckbox.disabled = argument;
	dateProcessingSelect.disabled = argument;
	exportDeidentifiedFilesButton.disabled = argument;
	exportDeidentifiedPatientNamesButton.disabled = argument;
	dicomTagExportPathInputText.disabled = argument;
	fileIndexCurrentInputRange.disabled = argument;
	keepPrivateAttributesInputCheckbox.disabled = argument;
	keepUIDsInputCheckbox.disabled = argument;
	replaceFileNameWithRandomInputCheckbox.disabled = argument;
	replacePatientNameWithFileIndexInputCheckbox.disabled = argument;
	showEmptyOriginalTagsInputCheckbox.disabled = argument;
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

function onloadFilesOrDirectories() {
	files = event.currentTarget.files;
	files = [...files].filter(file => file.type === 'application/dicom');
	filesNum = files.length;
	if (filesNum === 0) {
		return;
	}
	fileIndexCurrentInputRange.max = filesNum - 1;
	resetTable();
	applyDeidentification();
}

function resetTable() {
	if (dicomTagValuesTable.tBodies.length === 1) {
		dicomTagValuesTable.tBodies[0].remove();
	}
	for (const [i, dicomTag] of dicomTagArray.entries()) {
		let row = dicomTagValuesTable.insertRow(i);
		let dicomTagCell = row.insertCell(0);
		let dicomTagValueOriginalCell = row.insertCell(1);
		let dicomTagValueDeidentifiedCell = row.insertCell(2);
		let applyGlobalValueDeidentifiedCell = row.insertCell(3);
		let applyGlobalValueIfEqualsDeidentifiedCell = row.insertCell(4);
		if (i === 0) {
			dicomTagCell.textContent = 'DICOM tag';
			dicomTagCell.style.fontWeight = 'bold';
			dicomTagValueOriginalCell.textContent = 'Original value';
			dicomTagValueOriginalCell.style.fontWeight = 'bold';
			dicomTagValueDeidentifiedCell.textContent = 'De-identified value';
			dicomTagValueDeidentifiedCell.style.fontWeight = 'bold';
		} else {
			const dicomTagCurrent = dcmjs.data.DicomMetaDictionary.nameMap[dicomTag];
			if (dicomTagCurrent) {
				dicomTagCell.textContent = `${dicomTagCurrent.tag} ${dicomTag}`;
			}
			dicomTagCell.style.borderStyle = 'groove';
			dicomTagValueOriginalCell.style.borderStyle = 'groove';
			dicomTagValueDeidentifiedCell.style.borderStyle = 'groove';
			dicomTagValueDeidentifiedCell.contentEditable = true;
			applyGlobalValueDeidentifiedCell.textContent = 'Apply global';
			applyGlobalValueDeidentifiedCell.style.backgroundColor = 'lightgray';
			applyGlobalValueDeidentifiedCell.style.borderStyle = 'groove';
			applyGlobalValueDeidentifiedCell.onclick = function() {
				const dicomTagSelected = dicomTagArray[this.parentNode.rowIndex];
				const globalValueSelected = datasetAfterAnonymizationArray[fileIndexCurrent][dicomTagSelected];
				for (const [i, datasetAfterAnonymization] of datasetAfterAnonymizationArray.entries()) {
					datasetAfterAnonymization[dicomTagSelected] = globalValueSelected;
					dicomDictArray[i].dict = dcmjs.data.DicomMetaDictionary.denaturalizeDataset(datasetAfterAnonymizationArray[i]);
				}
			}
			applyGlobalValueIfEqualsDeidentifiedCell.textContent = 'Apply global if equals';
			applyGlobalValueIfEqualsDeidentifiedCell.style.backgroundColor = 'lightgray';
			applyGlobalValueIfEqualsDeidentifiedCell.style.borderStyle = 'groove';
			applyGlobalValueIfEqualsDeidentifiedCell.onclick = function() {
				const dicomTagSelected = dicomTagArray[this.parentNode.rowIndex];
				const globalValueSelected = datasetAfterAnonymizationArray[fileIndexCurrent][dicomTagSelected];
				for (const [i, datasetAfterAnonymization] of datasetAfterAnonymizationArray.entries()) {
					if (datasetBeforeAnonymizationArray[i][dicomTagSelected] === datasetBeforeAnonymizationArray[fileIndexCurrent][dicomTagSelected]) {
						datasetAfterAnonymization[dicomTagSelected] = globalValueSelected;
						dicomDictArray[i].dict = dcmjs.data.DicomMetaDictionary.denaturalizeDataset(datasetAfterAnonymizationArray[i]);
					}
				}
			}
		}
	}
	dicomTagValuesTable.tBodies[0].onkeyup = function() {
		const rowIndex = event.target.parentNode.rowIndex;
		if (!(Array.isArray(datasetBeforeAnonymizationArray[fileIndexCurrent][dicomTagArray[rowIndex]]))) {
			datasetAfterAnonymizationArray[fileIndexCurrent][dicomTagArray[rowIndex]] = dicomTagValuesTable.rows[rowIndex].cells[2].textContent;
			dicomDictArray[fileIndexCurrent].dict = dcmjs.data.DicomMetaDictionary.denaturalizeDataset(datasetAfterAnonymizationArray[fileIndexCurrent]);
		}
	}
}

function resetVariables() {
	applyDeidentificationProfileInputCheckbox.checked = false;
	datasetAfterAnonymizationArray = [];
	datasetBeforeAnonymizationArray = [];
	dateProcessingSelect.value = 'dateProcessingKeepOption';
	dicomDictArray = [];
	dicomTagExportPathInputText.value = '00100010/00080060/00200011/';
	fileIndexCurrent = 0;
	fileIndexCurrentInputRange.max = 0;
	fileIndexCurrentInputRange.value = 0;
	fileIndexCurrentSpan.textContent = '';
	filesNum = 0;
	patientNameArray = [];
	replaceFileNameWithRandomInputCheckbox.checked = false;
	replacePatientNameWithFileIndexInputCheckbox.checked = false;
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

applyDeidentificationProfileInputCheckbox.onchange = function() {
	applyDeidentification();
}

dateProcessingSelect.onchange = function() {
	applyDeidentification();
}

dicomTagExportPathInputText.onkeydown = function() {
	dicomTagExportPathInputText.setCustomValidity('');
}

dicomTagExportPathInputText.oninput = function() {
	const cursorPosition = dicomTagExportPathInputText.selectionStart - 1;
	const hasInvalidCharacters = dicomTagExportPathInputText.value.match(/[^0-9^A-E/]/);
	if (!hasInvalidCharacters) {
		return;
	}
	dicomTagExportPathInputText.value = dicomTagExportPathInputText.value.replace(/[^0-9^A-E/]/g, '');
	dicomTagExportPathInputText.setSelectionRange(cursorPosition, cursorPosition);
}

exportDeidentifiedFilesButton.onclick = function() {
	disableUI(true);
	const zip = new JSZip();
	for (const [i, dicomDict] of dicomDictArray.entries()) {
		let dicomTagValueExportPath = '';
		if (dicomTagExportPathInputText.value !== '') {
			const dicomTagExportPathArray = dicomTagExportPathInputText.value.slice(0, -1).split('/');
			for (const dicomTagExportPath of dicomTagExportPathArray) {
				if (!(dicomDict.dict[dicomTagExportPath])) {
					dicomTagExportPathInputText.setCustomValidity('invalid');
					disableUI(false);
					return;
				} else if (!(dicomDict.dict[dicomTagExportPath].Value)){
					dicomTagExportPathInputText.setCustomValidity('invalid');
					disableUI(false);
					return;
				} else if (!(dicomDict.dict[dicomTagExportPath].Value[0])){
					dicomTagExportPathInputText.setCustomValidity('invalid');
					disableUI(false);
					return;
				}
			}
			dicomTagValueExportPath = dicomTagExportPathArray.map(x => dicomDict.dict[x].Value[0]).join('/') + '/';
		}
		const dicomTagValueExportPathArray = dicomTagValueExportPath.split('/');
		for (let j = dicomTagValueExportPathArray.length; j > 0; j--) {
			zip.file(dicomTagValueExportPathArray.slice(0, j).join('/') + '/', '', {date: new Date("January 02, 2000 00:00:00")});
		}
		let fileName;
		if (replaceFileNameWithRandomInputCheckbox.checked) {
			fileName = `${Date.now()}-${hashCode(JSON.stringify(dicomDict))}`;
		} else {
			fileName = files[i].name;
			if (fileName.includes('.')) {
				fileName = fileName.substr(0, fileName.lastIndexOf('.'));
			}
		}
		zip.file(`${dicomTagValueExportPath}${fileName}.dcm`, dicomDict.write({allowInvalidVRLength: true}), {date: new Date("January 02, 2000 00:00:00")});
	}
	zip.generateAsync({type:'blob'})
		.then(function (blob) {
			saveData(blob, 'files.zip');
			disableUI(false);
		});
}

exportDeidentifiedPatientNamesButton.onclick = function() {
	const csvContent = 'Patient name (De-identified), Patient name\n' + patientNameArray.map((patientName, index) => `Patient-${index}, ${patientName}`).join('\n') + '\n';
	const blob = new Blob([csvContent]);
	saveData(blob, 'de-identified-patient-names.csv');
}

fileIndexCurrentInputRange.oninput = function() {
	fileIndexCurrent = parseInt(this.value);
	fileIndexCurrentSpan.textContent = `${fileIndexCurrent}/${filesNum}`;
	for (const [i, dicomTag] of dicomTagArray.entries()) {
		if (i === 0) {
			continue;
		}
		dicomTagValuesTable.rows[i].cells[1].textContent = datasetBeforeAnonymizationArray[fileIndexCurrent][dicomTag];
		dicomTagValuesTable.rows[i].cells[2].textContent = datasetAfterAnonymizationArray[fileIndexCurrent][dicomTag];
	}
}

keepPrivateAttributesInputCheckbox.onchange = function() {
	applyDeidentification();
}

keepUIDsInputCheckbox.onchange = function() {
	applyDeidentification();
}

replacePatientNameWithFileIndexInputCheckbox.onchange = function() {
	applyDeidentification();
}

showEmptyOriginalTagsInputCheckbox.onclick = function() {
	for (const [i, dicomTag] of dicomTagArray.entries()) {
		if (datasetBeforeAnonymizationArray[fileIndexCurrent][dicomTag] === undefined & (i !== 0) & (!this.checked)) {
			dicomTagValuesTable.rows[i].style.display = 'none';
		} else {
			dicomTagValuesTable.rows[i].style.display = 'block';
		}
	}
}

disableUI(true);
resetVariables();
