'use strict';

let dicomDictArray = [];
let dicomTagValueTable = document.getElementById('dicomTagValueTable');

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

for (const [i, dicomTag] of dicomTagArray.entries()) {
	let row = dicomTagValueTable.insertRow(i);
	let cellRowName = row.insertCell(0);
	let cellOriginalValue = row.insertCell(1);
	let cellDeidentifiedValue = row.insertCell(2);
	cellRowName.textContent = dicomTag;
	cellOriginalValue.textContent = '';
	cellDeidentifiedValue.textContent = '';
}

function loadFiles() {
	const files = event.currentTarget.files;
	for (let i = 0; i < files.length; i++) {
		const reader = new FileReader();
		reader.onload = function() {
			dicomDictArray[i] = dcmjs.data.DicomMessage.readFile(reader.result);
			const datasetBeforeAnonymization = dcmjs.data.DicomMetaDictionary.naturalizeDataset(dicomDictArray[i].dict);
			for (const [j, dicomTag] of dicomTagArray.entries()) {
				dicomTagValueTable.rows[j].cells[1].textContent = datasetBeforeAnonymization[dicomTag];
			}
			dcmjs.anonymizer.cleanTags(dicomDictArray[i].dict);
			const datasetAfterAnonymization = dcmjs.data.DicomMetaDictionary.naturalizeDataset(dicomDictArray[i].dict);
			for (const [j, dicomTag] of dicomTagArray.entries()) {
				dicomTagValueTable.rows[j].cells[2].textContent = datasetAfterAnonymization[dicomTag];
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
	for (let i = 0; i < dicomDictArray.length; i++) {
		zip.file(`image-${i}.dcm`, dicomDictArray[i].write());
	}
	zip.generateAsync({type:'blob'})
		.then(function (blob) {
			saveData(blob, 'images.zip');
		});
}
