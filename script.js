'use strict';

const buttonSaveDeidentifiedFiles = document.getElementById('buttonSaveDeidentifiedFiles');
const dicomTagArray = Object.keys(dcmjs.data.DicomMetaDictionary.nameMap);
const inputCheckboxShowEmptyOriginalTags = document.getElementById('inputCheckboxShowEmptyOriginalTags');
const inputRangeFileIndex = document.getElementById('inputRangeFileIndex');
const spanFileIndex = document.getElementById('spanFileIndex');

let datasetAfterAnonymizationArray = [];
let datasetBeforeAnonymizationArray = [];
let dicomDictArray = [];
let fileIndex = 0;
let numFiles = 0;

function loadFiles() {
	spanFileIndex.textContent = 'Loading files';
	const files = event.currentTarget.files;
	if (files.length === 0) {
		event.target.value = '';
		resetData();
		resetTable();
		return;
	}
	numFiles = files.length;
	inputRangeFileIndex.max = numFiles - 1;
	for (let i = 0; i < numFiles; i++) {
		const reader = new FileReader();
		reader.onload = function() {
			dicomDictArray[i] = dcmjs.data.DicomMessage.readFile(reader.result);
			datasetBeforeAnonymizationArray[i] = dcmjs.data.DicomMetaDictionary.naturalizeDataset(dicomDictArray[i].dict);
			dcmjs.anonymizer.cleanTags(dicomDictArray[i].dict);
			datasetAfterAnonymizationArray[i] = dcmjs.data.DicomMetaDictionary.naturalizeDataset(dicomDictArray[i].dict);
			if (i === files.length - 1) {
				inputRangeFileIndex.oninput();
				inputCheckboxShowEmptyOriginalTags.onclick();
				disableUI(false);
			}
		};
		reader.readAsArrayBuffer(files[i]);
	}
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
	const zip = new JSZip();
	for (const [i, dicomDict] of dicomDictArray.entries()) {
		zip.file(`file-${i}.dcm`, dicomDict.write());
	}
	zip.generateAsync({type:'blob'})
		.then(function (blob) {
			saveData(blob, 'files.zip');
		});
}

function saveValuesFromRowToVariables(rowIndex) {
	datasetAfterAnonymizationArray[fileIndex][dicomTagArray[rowIndex]] = tableDICOMTagValues.rows[rowIndex].cells[3].textContent;
	dicomDictArray[fileIndex].dict = dcmjs.data.DicomMetaDictionary.denaturalizeDataset(datasetAfterAnonymizationArray[fileIndex]);
}

function resetTable() {
	if (tableDICOMTagValues.tBodies.length === 1) {
		tableDICOMTagValues.tBodies[0].remove();
	}
	for (const [i, dicomTag] of dicomTagArray.entries()) {
		let row = tableDICOMTagValues.insertRow(i);
		row.style.display = 'none';
		let cellDICOMTagName = row.insertCell(0);
		let cellDICOMTag = row.insertCell(1);
		let cellDICOMTagValueOriginal = row.insertCell(2);
		let cellDICOMTagValueDeidentified = row.insertCell(3);
		let cellApplyGlobalValueDeidentified = row.insertCell(4);
		cellDICOMTagName.textContent = dicomTag;
		cellDICOMTagName.style.border = '1px';
		cellDICOMTagName.style.borderStyle = 'solid';
		const currentTag = dcmjs.data.DicomMetaDictionary.nameMap[dicomTag];
		if (currentTag) {
			cellDICOMTag.textContent = currentTag.tag;
		}
		cellDICOMTag.style.border = '1px';
		cellDICOMTag.style.borderStyle = 'solid';
		cellDICOMTagValueOriginal.textContent = '';
		cellDICOMTagValueOriginal.style.border = '1px';
		cellDICOMTagValueOriginal.style.borderStyle = 'solid';
		cellDICOMTagValueDeidentified.textContent = '';
		cellDICOMTagValueDeidentified.style.borderStyle = 'solid';
		cellDICOMTagValueDeidentified.contentEditable = true;
		cellApplyGlobalValueDeidentified.textContent = 'Apply global';
		cellApplyGlobalValueDeidentified.style.backgroundColor = '#D3D3D3';
		cellApplyGlobalValueDeidentified.style.borderStyle = 'solid';
		cellApplyGlobalValueDeidentified.addEventListener('click', function(){
			const selectedDicomTag = dicomTagArray[this.parentNode.rowIndex];
			const selectedGlobalValue = datasetAfterAnonymizationArray[fileIndex][selectedDicomTag];
			for (const [i, datasetAfterAnonymization] of datasetAfterAnonymizationArray.entries()) {
				datasetAfterAnonymization[selectedDicomTag] = selectedGlobalValue;
			}
			saveValuesFromRowToVariables(event.target.parentNode.rowIndex);
		});
	}
	tableDICOMTagValues.tBodies[0].onkeyup = function() {
		saveValuesFromRowToVariables(event.target.parentNode.rowIndex);
	}
}

function disableUI(argument) {
	buttonSaveDeidentifiedFiles.disabled = argument;
	inputCheckboxShowEmptyOriginalTags.disabled = argument;
	inputRangeFileIndex.disabled = argument;
}

function resetData() {
	datasetAfterAnonymizationArray = [];
	datasetBeforeAnonymizationArray = [];
	dicomDictArray = [];
	fileIndex = 0;
	inputRangeFileIndex.max = 0;
	inputRangeFileIndex.value = 0;
	numFiles = 0;
	spanFileIndex.textContent = '';
}

inputRangeFileIndex.oninput = function() {
	fileIndex = parseInt(this.value);
	spanFileIndex.textContent = `${fileIndex}/${numFiles}`;
	for (const [i, dicomTag] of dicomTagArray.entries()) {
		tableDICOMTagValues.rows[i].cells[2].textContent = datasetBeforeAnonymizationArray[fileIndex][dicomTag];
		tableDICOMTagValues.rows[i].cells[3].textContent = datasetAfterAnonymizationArray[fileIndex][dicomTag];
	}
}

inputCheckboxShowEmptyOriginalTags.onclick = function() {
	let newDisplay;
	if (this.checked) {
		newDisplay = 'block';
	} else {
		newDisplay = 'none';
	}
	for (const [i, dicomTag] of dicomTagArray.entries()) {
		if (datasetBeforeAnonymizationArray[fileIndex][dicomTag] === undefined) {
			tableDICOMTagValues.rows[i].style.display = newDisplay;
		} else {
			tableDICOMTagValues.rows[i].style.display = 'block';
		}
	}
}

disableUI(true);
resetData();
resetTable();
