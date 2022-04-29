'use strict';

const dicomTagArray = Object.keys(dcmjs.data.DicomMetaDictionary.nameMap);
const fileCurrentIndexInputRange = document.getElementById('fileCurrentIndexInputRange');
const fileCurrentIndexSpan = document.getElementById('fileCurrentIndexSpan');
const saveDeidentifiedFilesButton = document.getElementById('saveDeidentifiedFilesButton');
const showEmptyOriginalTagsInputCheckbox = document.getElementById('showEmptyOriginalTagsInputCheckbox');

let datasetAfterAnonymizationArray = [];
let datasetBeforeAnonymizationArray = [];
let dicomDictArray = [];
let fileCurrentIndex = 0;
let filesNum = 0;

function disableUI(argument) {
	fileCurrentIndexInputRange.disabled = argument;
	loadFilesInputFile.disabled = argument;
	saveDeidentifiedFilesButton.disabled = argument;
	showEmptyOriginalTagsInputCheckbox.disabled = argument;
}

function loadFiles() {
	const files = event.currentTarget.files;
	if (files.length === 0) {
		return;
	}
	filesNum = files.length;
	fileCurrentIndexInputRange.max = filesNum - 1;
	for (let i = 0; i < filesNum; i++) {
		const reader = new FileReader();
		reader.onload = function() {
			dicomDictArray[i] = dcmjs.data.DicomMessage.readFile(reader.result);
			datasetBeforeAnonymizationArray[i] = dcmjs.data.DicomMetaDictionary.naturalizeDataset(dicomDictArray[i].dict);
			dcmjs.anonymizer.cleanTags(dicomDictArray[i].dict);
			datasetAfterAnonymizationArray[i] = dcmjs.data.DicomMetaDictionary.naturalizeDataset(dicomDictArray[i].dict);
			if (i === files.length - 1) {
				fileCurrentIndexInputRange.oninput();
				showEmptyOriginalTagsInputCheckbox.onclick();
				disableUI(false);
			}
		};
		reader.readAsArrayBuffer(files[i]);
	}
}

function resetTable() {
	if (dicomTagValuesTable.tBodies.length === 1) {
		dicomTagValuesTable.tBodies[0].remove();
	}
	for (const [i, dicomTag] of dicomTagArray.entries()) {
		let row = dicomTagValuesTable.insertRow(i);
		let dicomTagNameCell = row.insertCell(0);
		let dicomTagCell = row.insertCell(1);
		let dicomTagCellValueOriginal = row.insertCell(2);
		let dicomTagCellValueDeidentified = row.insertCell(3);
		let applyGlobalValueDeidentifiedCell = row.insertCell(4);
		if (i === 0) {
			dicomTagNameCell.textContent = 'DICOM tag name';
			dicomTagNameCell.style.fontWeight = 'bold';
			dicomTagCell.textContent = 'DICOM tag';
			dicomTagCell.style.fontWeight = 'bold';
			dicomTagCellValueOriginal.textContent = 'Original value';
			dicomTagCellValueOriginal.style.fontWeight = 'bold';
			dicomTagCellValueDeidentified.textContent = 'Deidentified value';
			dicomTagCellValueDeidentified.style.fontWeight = 'bold';
			applyGlobalValueDeidentifiedCell.textContent = 'Global button';
			applyGlobalValueDeidentifiedCell.style.fontWeight = 'bold';
		} else {
			dicomTagNameCell.textContent = dicomTag;
			dicomTagNameCell.style.borderStyle = 'groove';
			const dicomTagCurrent = dcmjs.data.DicomMetaDictionary.nameMap[dicomTag];
			if (dicomTagCurrent) {
				dicomTagCell.textContent = dicomTagCurrent.tag;
			}
			dicomTagCell.style.borderStyle = 'groove';
			dicomTagCellValueOriginal.style.borderStyle = 'groove';
			dicomTagCellValueDeidentified.style.borderStyle = 'groove';
			dicomTagCellValueDeidentified.contentEditable = true;
			applyGlobalValueDeidentifiedCell.textContent = 'Apply global';
			applyGlobalValueDeidentifiedCell.style.backgroundColor = 'lightgray';
			applyGlobalValueDeidentifiedCell.style.borderStyle = 'groove';
			applyGlobalValueDeidentifiedCell.addEventListener('click', function(){
				const dicomTagSelected = dicomTagArray[this.parentNode.rowIndex];
				const globalValueSelected = datasetAfterAnonymizationArray[fileCurrentIndex][dicomTagSelected];
				for (const [i, datasetAfterAnonymization] of datasetAfterAnonymizationArray.entries()) {
					datasetAfterAnonymization[dicomTagSelected] = globalValueSelected;
					dicomDictArray[i].dict = dcmjs.data.DicomMetaDictionary.denaturalizeDataset(datasetAfterAnonymizationArray[i]);
				}
				saveValuesFromRowToVariables(event.target.parentNode.rowIndex);
			});
		}
	}
	dicomTagValuesTable.tBodies[0].onkeyup = function() {
		saveValuesFromRowToVariables(event.target.parentNode.rowIndex);
	}
}

function resetVariables() {
	datasetAfterAnonymizationArray = [];
	datasetBeforeAnonymizationArray = [];
	dicomDictArray = [];
	fileCurrentIndex = 0;
	fileCurrentIndexInputRange.max = 0;
	fileCurrentIndexInputRange.value = 0;
	fileCurrentIndexSpan.textContent = '';
	filesNum = 0;
}

function saveData(blob, filename) {
	const a = document.createElement('a');
	document.body.appendChild(a);
	a.style = 'display: none';
	const url = window.URL.createObjectURL(blob);
	a.href = url;
	a.download = filename;
	a.click();
	window.URL.revokeObjectURL(url);
}

function saveDeidentifiedFiles() {
	disableUI(true);
	const zip = new JSZip();
	for (const [i, dicomDict] of dicomDictArray.entries()) {
		zip.file(`file-${i}.dcm`, dicomDict.write());
	}
	zip.generateAsync({type:'blob'})
		.then(function (blob) {
			saveData(blob, 'files.zip');
			disableUI(false);
		});
}

function saveValuesFromRowToVariables(rowIndex) {
	if (!(Array.isArray(datasetAfterAnonymizationArray[fileCurrentIndex][dicomTagArray[rowIndex]]))) {
		datasetAfterAnonymizationArray[fileCurrentIndex][dicomTagArray[rowIndex]] = dicomTagValuesTable.rows[rowIndex].cells[3].textContent;
		dicomDictArray[fileCurrentIndex].dict = dcmjs.data.DicomMetaDictionary.denaturalizeDataset(datasetAfterAnonymizationArray[fileCurrentIndex]);
	}
}

fileCurrentIndexInputRange.oninput = function() {
	fileCurrentIndex = parseInt(this.value);
	fileCurrentIndexSpan.textContent = `${fileCurrentIndex}/${filesNum}`;
	for (const [i, dicomTag] of dicomTagArray.entries()) {
		if (i === 0) {
			continue;
		}
		dicomTagValuesTable.rows[i].cells[2].textContent = datasetBeforeAnonymizationArray[fileCurrentIndex][dicomTag];
		dicomTagValuesTable.rows[i].cells[3].textContent = datasetAfterAnonymizationArray[fileCurrentIndex][dicomTag];
	}
}

showEmptyOriginalTagsInputCheckbox.onclick = function() {
	let styleDisplayNew;
	if (this.checked) {
		styleDisplayNew = 'block';
	} else {
		styleDisplayNew = 'none';
	}
	for (const [i, dicomTag] of dicomTagArray.entries()) {
		if (datasetBeforeAnonymizationArray[fileCurrentIndex][dicomTag] === undefined & (i !== 0)) {
			dicomTagValuesTable.rows[i].style.display = styleDisplayNew;
		} else {
			dicomTagValuesTable.rows[i].style.display = 'block';
		}
	}
}

disableUI(true);
resetVariables();
resetTable();
loadFilesInputFile.disabled = false;
