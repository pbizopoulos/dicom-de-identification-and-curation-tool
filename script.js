'use strict';

const dicomTagArray = Object.keys(dcmjs.data.DicomMetaDictionary.nameMap);
const fileIndexCurrentInputRange = document.getElementById('fileIndexCurrentInputRange');
const fileIndexCurrentSpan = document.getElementById('fileIndexCurrentSpan');
const loadFilesInputFile = document.getElementById('loadFilesInputFile');
const saveDeidentifiedFilesAsZipButton = document.getElementById('saveDeidentifiedFilesAsZipButton');
const saveDeidentifiedFilesButton = document.getElementById('saveDeidentifiedFilesButton');
const showEmptyOriginalTagsInputCheckbox = document.getElementById('showEmptyOriginalTagsInputCheckbox');
let datasetAfterAnonymizationArray = [];
let datasetBeforeAnonymizationArray = [];
let dicomDictArray = [];
let fileIndexCurrent = 0;
let filesNum = 0;

function disableUI(argument) {
	fileIndexCurrentInputRange.disabled = argument;
	saveDeidentifiedFilesAsZipButton.disabled = argument;
	saveDeidentifiedFilesButton.disabled = argument;
	showEmptyOriginalTagsInputCheckbox.disabled = argument;
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
			dicomTagCellValueDeidentified.textContent = 'De-identified value';
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
			applyGlobalValueDeidentifiedCell.onclick = function() {
				const dicomTagSelected = dicomTagArray[this.parentNode.rowIndex];
				const globalValueSelected = datasetAfterAnonymizationArray[fileIndexCurrent][dicomTagSelected];
				for (const [i, datasetAfterAnonymization] of datasetAfterAnonymizationArray.entries()) {
					datasetAfterAnonymization[dicomTagSelected] = globalValueSelected;
					dicomDictArray[i].dict = dcmjs.data.DicomMetaDictionary.denaturalizeDataset(datasetAfterAnonymizationArray[i]);
				}
				saveValuesFromRowToVariables(event.target.parentNode.rowIndex);
			}
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
	fileIndexCurrent = 0;
	fileIndexCurrentInputRange.max = 0;
	fileIndexCurrentInputRange.value = 0;
	fileIndexCurrentSpan.textContent = '';
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

function saveValuesFromRowToVariables(rowIndex) {
	if (!(Array.isArray(datasetBeforeAnonymizationArray[fileIndexCurrent][dicomTagArray[rowIndex]]))) {
		datasetAfterAnonymizationArray[fileIndexCurrent][dicomTagArray[rowIndex]] = dicomTagValuesTable.rows[rowIndex].cells[3].textContent;
		dicomDictArray[fileIndexCurrent].dict = dcmjs.data.DicomMetaDictionary.denaturalizeDataset(datasetAfterAnonymizationArray[fileIndexCurrent]);
	}
}

fileIndexCurrentInputRange.oninput = function() {
	fileIndexCurrent = parseInt(this.value);
	fileIndexCurrentSpan.textContent = `${fileIndexCurrent}/${filesNum}`;
	for (const [i, dicomTag] of dicomTagArray.entries()) {
		if (i === 0) {
			continue;
		}
		dicomTagValuesTable.rows[i].cells[2].textContent = datasetBeforeAnonymizationArray[fileIndexCurrent][dicomTag];
		dicomTagValuesTable.rows[i].cells[3].textContent = datasetAfterAnonymizationArray[fileIndexCurrent][dicomTag];
	}
}

loadFilesInputFile.onchange = function() {
	const files = event.currentTarget.files;
	if (files.length === 0) {
		return;
	}
	filesNum = files.length;
	fileIndexCurrentInputRange.max = filesNum - 1;
	for (let i = 0; i < filesNum; i++) {
		const reader = new FileReader();
		reader.onload = function() {
			dicomDictArray[i] = dcmjs.data.DicomMessage.readFile(reader.result);
			datasetBeforeAnonymizationArray[i] = dcmjs.data.DicomMetaDictionary.naturalizeDataset(dicomDictArray[i].dict);
			dcmjs.anonymizer.cleanTags(dicomDictArray[i].dict);
			delete dicomDictArray[i].dict['00400245'] // Only for review.
			delete dicomDictArray[i].dict['00081140'] // Only for review.
			// delete dicomDictArray[i].dict['0018A001'].Value[0]['0018A003'] // Only for review.
			// dicomDictArray[i].dict['0018A001'].Value[0]['00081010'].Value = [''] // Only for review.
			datasetAfterAnonymizationArray[i] = dcmjs.data.DicomMetaDictionary.naturalizeDataset(dicomDictArray[i].dict);
			if (i === files.length - 1) {
				fileIndexCurrentInputRange.oninput();
				showEmptyOriginalTagsInputCheckbox.onclick();
				disableUI(false);
			}
		};
		reader.readAsArrayBuffer(files[i]);
	}
}

saveDeidentifiedFilesAsZipButton.onclick = function() {
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

saveDeidentifiedFilesButton.onclick = function() {
	disableUI(true);
	for (const [i, dicomDict] of dicomDictArray.entries()) {
		const blob = new Blob([dicomDict.write()]);
		saveData(blob, `file-${i}.dcm`);
	}
	disableUI(false);
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
resetTable();
