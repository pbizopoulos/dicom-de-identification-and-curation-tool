'use strict';

const dicomTagSavePathInputText = document.getElementById('dicom-tag-save-path-input-text');
const dicomTagValuesRemovedNumSpan = document.getElementById('dicom-tag-values-removed-num-span');
const dicomTagValuesReplacedNumSpan = document.getElementById('dicom-tag-values-replaced-num-span');
const filesProcessedNumSpan = document.getElementById('files-processed-num-span');
const loadDirectoryInputFile = document.getElementById('load-directory-input-file');
const loadFilesInputFile = document.getElementById('load-files-input-file');
const loadPatientIdsInputFile = document.getElementById('load-patient-ids-input-file');
const nemaModifiedTableObject = JSON.parse(nemaModifiedTableString);
const patientIdPrefixInputText = document.getElementById('patient-id-prefix-input-text');
const retainDatesInputCheckbox = document.getElementById('retain-dates-input-checkbox');
const retainDescriptionsInputCheckbox = document.getElementById('retain-descriptions-input-checkbox');
const retainPatientCharacteristicsInputCheckbox = document.getElementById('retain-patient-characteristics-input-checkbox');
const retainUidsInputCheckbox = document.getElementById('retain-uids-input-checkbox');
const saveProcessedFilesAsZipButton = document.getElementById('save-processed-files-as-zip-button');
let dicomDictArray = [];
let fileArray = [];
let fileReaderArray = [];
let filesNum = 0;
let patientIdObject = {};
loadDirectoryInputFile.onchange = onloadFilesOrDirectory;
loadFilesInputFile.onchange = onloadFilesOrDirectory;

function disableUI(argument) {
	retainDatesInputCheckbox.disabled = argument;
	retainDescriptionsInputCheckbox.disabled = argument;
	retainPatientCharacteristicsInputCheckbox.disabled = argument;
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

function onloadFilesOrDirectory() {
	disableUI(true);
	fileArray = event.currentTarget.files;
	fileArray = [...fileArray].filter(file => file.type === 'application/dicom');
	filesNum = fileArray.length;
	if (filesNum === 0) {
		return;
	}
	fileReaderArray = [];
	for (let i = 0; i < filesNum; i++) {
		const fileReader = new FileReader();
		fileReader.readAsArrayBuffer(fileArray[i]);
		fileReader.onload = function() {
			fileReaderArray[i] = fileReader.result;
		};
	}
	disableUI(false);
}

function saveData(data, fileName) {
	const a = document.createElement('a');
	document.body.appendChild(a);
	const blob = new Blob(data);
	const url = window.URL.createObjectURL(blob);
	a.href = url;
	a.download = fileName;
	a.click();
	window.URL.revokeObjectURL(url);
}

loadPatientIdsInputFile.onchange = function() {
	const file = event.currentTarget.files[0];
	if (file.length === 0) {
		return;
	}
	const fileReader = new FileReader();
	fileReader.readAsText(file);
	fileReader.onload = function (e) {
		patientIdObject = JSON.parse(e.target.result);
	};
};

saveProcessedFilesAsZipButton.onclick = function() {
	disableUI(true);
	const zip = new JSZip();
	let dicomTagValuesRemovedNum = 0;
	let dicomTagValuesReplacedNum = 0;
	for (let i = 0; i < filesNum; i++) {
		dicomDictArray[i] = dcmjs.data.DicomMessage.readFile(fileReaderArray[i]);
		for (const property in nemaModifiedTableObject) {
			if (nemaModifiedTableObject[property][1] === 'K' && retainUidsInputCheckbox.checked) {
				continue;
			} else if (nemaModifiedTableObject[property][2] === 'K' && retainPatientCharacteristicsInputCheckbox.checked) {
				continue;
			} else if (nemaModifiedTableObject[property][3] === 'K' && retainDatesInputCheckbox.checked) {
				continue;
			} else if (nemaModifiedTableObject[property][4] === 'K' && retainDescriptionsInputCheckbox.checked) {
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
				zip.file('patient-ids.json', JSON.stringify(patientIdObject), {date: new Date('January 02, 2000 00:00:00')});
				zip.generateAsync({type:'arraybuffer'})
					.then(function (arraybuffer) {
						saveData([arraybuffer], 'de-identified-files.zip');
						disableUI(false);
					});
			}
		});
	}
};

disableUI(true);
