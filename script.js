'use strict';

const spanImageIndex = document.getElementById('spanImageIndex');
const inputRangeFileIndex = document.getElementById('inputRangeFileIndex');
const dicomTagArray = [
	'PatientName',
	'PatientID',
	'PatientBirthDate',
	'StudyDescription',
	'ProtocolName',
	'AccessionNumber',
	'StudyID',
	'StudyDate',
	'StudyTime',
	'SeriesDescription',
	'SeriesDate',
	'SeriesTime',
	'AcquisitionDate',
	'AcquisitionTime',
	'ContentDate',
	'ContentTime']

let datasetAfterAnonymizationArray = [];
let datasetBeforeAnonymizationArray = [];
let dicomDictArray = [];
let fileIndex = 0;
let numFiles = 0;

function loadFiles() {
	const files = event.currentTarget.files;
	if (files.length === 0) {
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

function saveDeidentifiedImages() {
	const zip = new JSZip();
	for (const [i, dicomDict] of dicomDictArray.entries()) {
		zip.file(`image-${i}.dcm`, dicomDict.write());
	}
	zip.generateAsync({type:'blob'})
		.then(function (blob) {
			saveData(blob, 'images.zip');
		});
}

function saveValuesFromTableToVariables() {
	for (const [j, dicomTag] of dicomTagArray.entries()) {
		datasetAfterAnonymizationArray[fileIndex][dicomTag] = dicomTagValueTable.rows[j].cells[2].textContent;
		dicomDictArray[fileIndex].dict = dcmjs.data.DicomMetaDictionary.denaturalizeDataset(datasetAfterAnonymizationArray[fileIndex]);
	}
}

function resetTable() {
	if (dicomTagValueTable.tBodies.length === 1) {
		dicomTagValueTable.tBodies[0].remove();
	}
	for (const [i, dicomTag] of dicomTagArray.entries()) {
		let row = dicomTagValueTable.insertRow(i);
		let cellRowName = row.insertCell(0);
		let cellOriginalValue = row.insertCell(1);
		let cellDeidentifiedValue = row.insertCell(2);
		let cellGlobalApplyDeidentifiedValue = row.insertCell(3);
		cellRowName.textContent = dicomTag;
		cellRowName.style = 'border:1px solid;';
		cellOriginalValue.textContent = '';
		cellOriginalValue.style = 'border:1px solid;';
		cellDeidentifiedValue.textContent = '';
		cellDeidentifiedValue.style = 'border:solid;';
		cellDeidentifiedValue.contentEditable = true;
		cellGlobalApplyDeidentifiedValue.textContent = 'Apply global';
		cellGlobalApplyDeidentifiedValue.style = 'background-color:#D3D3D3;border:solid;';
		cellGlobalApplyDeidentifiedValue.addEventListener("click",function(){
			const selectedDicomTag = dicomTagArray[this.parentNode.rowIndex];
			const selectedGlobalValue = datasetAfterAnonymizationArray[fileIndex][selectedDicomTag];
			for (const [i, datasetAfterAnonymization] of datasetAfterAnonymizationArray.entries()) {
				datasetAfterAnonymization[selectedDicomTag] = selectedGlobalValue;
			}
			saveValuesFromTableToVariables();
		});
	}
	dicomTagValueTable.tBodies[0].onkeyup = function() {
		saveValuesFromTableToVariables();
	}
}

function resetData() {
	inputRangeFileIndex.max = 0;
	spanFileIndex.textContent = '';
	datasetAfterAnonymizationArray = [];
	datasetBeforeAnonymizationArray = [];
	dicomDictArray = [];
	fileIndex = 0;
	numFiles = 0;
}

inputRangeFileIndex.oninput = function() {
	fileIndex = parseInt(this.value);
	spanFileIndex.textContent = `${fileIndex}/${numFiles}`;
	for (const [j, dicomTag] of dicomTagArray.entries()) {
		dicomTagValueTable.rows[j].cells[1].textContent = datasetBeforeAnonymizationArray[fileIndex][dicomTag];
		dicomTagValueTable.rows[j].cells[2].textContent = datasetAfterAnonymizationArray[fileIndex][dicomTag];
	}
}

resetTable();
