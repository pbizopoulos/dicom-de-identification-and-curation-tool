'use strict';

const dicomTagSavePathInputText = document.getElementById('dicomTagSavePathInputText');
const dicomTagValuesRemovedNumSpan = document.getElementById('dicomTagValuesRemovedNumSpan');
const dicomTagValuesReplacedNumSpan = document.getElementById('dicomTagValuesReplacedNumSpan');
const filesProcessedNumSpan = document.getElementById('filesProcessedNumSpan');
const loadFilesInputFile = document.getElementById('loadFilesInputFile');
const loadPatientIdsInputFile = document.getElementById('loadPatientIdsInputFile');
const nemaModifiedTableObject = JSON.parse(nemaModifiedTableString);
const patientIdPrefixInputText = document.getElementById('patientIdPrefixInputText');
const retainDatesInputCheckbox = document.getElementById('retainDatesInputCheckbox');
const retainDescriptionsInputCheckbox = document.getElementById('retainDescriptionsInputCheckbox');
const retainUidsInputCheckbox = document.getElementById('retainUidsInputCheckbox');
const saveProcessedFilesAsZipButton = document.getElementById('saveProcessedFilesAsZipButton');
let dicomDictArray = [];
let fileArray = [];
let filesNum = 0;
let patientIdObject = {};
let readerArray = [];

function disableUI(argument) {
	retainDatesInputCheckbox.disabled = argument;
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

loadDirectoryInputFile.onchange = function() {
	disableUI(true);
	fileArray = event.currentTarget.files;
	fileArray = [...fileArray].filter(file => file.type === 'application/dicom');
	filesNum = fileArray.length;
	if (filesNum === 0) {
		return;
	}
	readerArray = [];
	for (let i = 0; i < filesNum; i++) {
		const reader = new FileReader();
		reader.onload = function() {
			readerArray[i] = reader.result;
		};
		reader.readAsArrayBuffer(fileArray[i]);
	}
	disableUI(false);
};

loadPatientIdsInputFile.onchange = function() {
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
			patientIdObject[rowElementArray[0]] = rowElementArray[1];
		}
	};
	reader.readAsText(file);
};

saveProcessedFilesAsZipButton.onclick = function() {
	disableUI(true);
	const zip = new JSZip();
	let dicomTagValuesRemovedNum = 0;
	let dicomTagValuesReplacedNum = 0;
	for (let i = 0; i < filesNum; i++) {
		dicomDictArray[i] = dcmjs.data.DicomMessage.readFile(readerArray[i]);
		for (const property in nemaModifiedTableObject) {
			if (nemaModifiedTableObject[property][1] === 'K' && retainUidsInputCheckbox.checked) {
				continue;
			} else if (nemaModifiedTableObject[property][2] === 'K' && retainDatesInputCheckbox.checked) {
				continue;
			} else if (nemaModifiedTableObject[property][3] === 'K' && retainDescriptionsInputCheckbox.checked) {
				continue;
			} else if (property === '00100010') {
				continue;
			} else if (property === '00100020') {
				if (property in dicomDictArray[i].dict) {
					const patientId = dicomDictArray[i].dict[property].Value[0];
					if (!(patientId in patientIdObject)) {
						const idNew = Object.keys(patientIdObject).length.toLocaleString('en-US', {minimumIntegerDigits: 6, useGrouping: false});
						patientIdObject[patientId] = `${patientIdPrefixInputText.value}${idNew}`;
					}
					dicomDictArray[i].dict[property].Value[0] = patientIdObject[patientId];
					dicomTagValuesReplacedNum++;
				}
			} else {
				if (property in dicomDictArray[i].dict) {
					dicomDictArray[i].dict[property].Value = [];
				} else {
					for (let dicomTagUpperLevel in dicomDictArray[i].dict) {
						if (dicomDictArray[i].dict[dicomTagUpperLevel].vr === 'SQ' && property in dicomDictArray[i].dict[dicomTagUpperLevel].Value[0]) {
							dicomDictArray[i].dict[dicomTagUpperLevel].Value[0][property].Value = [];
							break;
						}
					}
				}
				dicomTagValuesRemovedNum++;
			}
			dicomDictArray[i].dict['00100010'].Value[0] = dicomDictArray[i].dict['00100020'].Value[0];
			dicomTagValuesReplacedNum++;
		}
		hashCode(JSON.stringify(dicomDictArray[i])).then((hex) => {
			const dicomTagSavePathArray = dicomTagSavePathInputText.value.slice(0, -1).split('/');
			const dicomTagValueSavePath = dicomTagSavePathArray.map(x => dicomDictArray[i].dict[x].Value[0]).join('/') + '/';
			const dicomTagValueSavePathArray = dicomTagValueSavePath.split('/');
			for (let j = 1; j < dicomTagValueSavePathArray.length; j++) {
				zip.file(dicomTagValueSavePathArray.slice(0, j).join('/') + '/', '', {date: new Date('January 02, 2000 00:00:00')});
			}
			zip.file(`${dicomTagValueSavePath}${hex}.dcm`, dicomDictArray[i].write({allowInvalidVRLength: true}), {date: new Date('January 02, 2000 00:00:00')});
			filesProcessedNumSpan.textContent = `${i+1}/${filesNum}`;
			if (i === filesNum - 1) {
				dicomTagValuesRemovedNumSpan.textContent = dicomTagValuesRemovedNum;
				dicomTagValuesReplacedNumSpan.textContent = dicomTagValuesReplacedNum;
				const patientIdString = Object.entries(patientIdObject).map((patientId) => patientId).join('\n') + '\n';
				const blob = new Blob([patientIdString]);
				zip.file('patient-ids.csv', blob, {date: new Date('January 02, 2000 00:00:00')});
				zip.generateAsync({type:'blob'})
					.then(function (blob) {
						saveData(blob, 'de-identified-files.zip');
						disableUI(false);
					});
			}
		});
	}
};

disableUI(true);
