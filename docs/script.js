'use strict';
const dateProcessingSelect = document.getElementById('date-processing-select');
const dicomTagSavePathInputText = document.getElementById('dicom-tag-save-path-input-text');
const dicomTagValuesRemovedNumSpan = document.getElementById('dicom-tag-values-removed-num-span');
const dicomTagValuesReplacedNumSpan = document.getElementById('dicom-tag-values-replaced-num-span');
const filesProcessedNumSpan = document.getElementById('files-processed-num-span');
const loadDirectoryInputFile = document.getElementById('load-directory-input-file');
const loadSessionInputFile = document.getElementById('load-session-input-file');
const patientPseudoIdPrefixInputText = document.getElementById('patient-pseudo-id-prefix-input-text');
const retainDescriptorsInputCheckbox = document.getElementById('retain-descriptors-input-checkbox');
const retainDeviceIdentityInputCheckbox = document.getElementById('retain-device-identity-input-checkbox');
const retainPatientCharacteristicsInputCheckbox = document.getElementById('retain-patient-characteristics-input-checkbox');
const retainSafePrivateInputCheckbox = document.getElementById('retain-safe-private-input-checkbox');
const retainUidsInputCheckbox = document.getElementById('retain-uids-input-checkbox');
const saveProcessedFilesAsZipButton = document.getElementById('save-processed-files-as-zip-button');
let dicomDictArray = [];
let fileArray = [];
let fileReaderArray = [];
let filesNum = 0;
let sessionObject = {};

function disableUI(argument) {
	dateProcessingSelect.disabled = argument;
	patientPseudoIdPrefixInputText.disabled = argument;
	retainDescriptorsInputCheckbox.disabled = argument;
	retainDeviceIdentityInputCheckbox.disabled = argument;
	retainPatientCharacteristicsInputCheckbox.disabled = argument;
	retainSafePrivateInputCheckbox.disabled = argument;
	retainUidsInputCheckbox.disabled = argument;
	saveProcessedFilesAsZipButton.disabled = argument;
}

function hashCode(string) {
	const utf8 = new TextEncoder().encode(string);
	return crypto.subtle.digest('SHA-256', utf8).then((hashBuffer) => {
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		const hashHex = hashArray.map((bytes) => bytes.toString(16).padStart(2, '0')).join('');
		return hashHex;
	});
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

loadDirectoryInputFile.oninput = function() {
	disableUI(true);
	fileArray = event.currentTarget.files;
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
};
loadSessionInputFile.oninput = function() {
	const file = event.currentTarget.files[0];
	if (file.length === 0) {
		return;
	}
	const fileReader = new FileReader();
	fileReader.readAsText(file);
	fileReader.onload = function(e) {
		sessionObject = JSON.parse(e.target.result);
	};
};
saveProcessedFilesAsZipButton.onclick = function() {
	disableUI(true);
	const zip = new JSZip();
	let dicomTagValuesRemovedNum = 0;
	let dicomTagValuesReplacedNum = 0;
	const patientIdDicomTag = '00100020';
	const patientNameDicomTag = '00100010';
	for (let i = 0; i < filesNum; i++) {
		try {
			dicomDictArray[i] = dcmjs.data.DicomMessage.readFile(fileReaderArray[i]);
		} catch (e) {
			console.log(e);
			continue;
		}
		let patientId;
		if (patientIdDicomTag in dicomDictArray[i].dict) {
			patientId = dicomDictArray[i].dict[patientIdDicomTag].Value[0];
			if (!(patientId in sessionObject)) {
				const patientPseudoIdBase = Object.keys(sessionObject).length.toLocaleString('en-US', {
					minimumIntegerDigits: 6,
					useGrouping: false
				});
				let daysOffset = Math.floor(Math.random() * 365 * 10 * 2) - 365 * 10;
				if (navigator.userAgent === 'playwright') {
					daysOffset = 0;
				}
				let secondsOffset = Math.floor(Math.random() * 60 * 60 * 24);
				if (navigator.userAgent === 'playwright') {
					secondsOffset = 0;
				}
				sessionObject[patientId] = {
					daysOffset: daysOffset,
					patientPseudoId: `${patientPseudoIdPrefixInputText.value}${patientPseudoIdBase}`,
					secondsOffset: secondsOffset
				};
			}
			dicomDictArray[i].dict[patientIdDicomTag].Value[0] = sessionObject[patientId].patientPseudoId;
			dicomTagValuesReplacedNum++;
			dicomDictArray[i].dict[patientNameDicomTag].Value[0] = dicomDictArray[i].dict[patientIdDicomTag].Value[0];
			dicomTagValuesReplacedNum++;
		}
		for (const dicomTag in dicomTagToNemaActionObject) {
			if (dicomTag === patientIdDicomTag) {
				continue;
			} else if (dicomTag === patientNameDicomTag) {
				continue;
			} else if (dicomTagToNemaActionObject[dicomTag][1] === 'K' && retainSafePrivateInputCheckbox.checked) {
				continue;
			} else if (dicomTagToNemaActionObject[dicomTag][2] === 'K' && retainUidsInputCheckbox.checked) {
				continue;
			} else if (dicomTagToNemaActionObject[dicomTag][3] === 'K' && retainDeviceIdentityInputCheckbox.checked) {
				continue;
			} else if (dicomTagToNemaActionObject[dicomTag][4] === 'K' && retainPatientCharacteristicsInputCheckbox.checked) {
				continue;
			} else if (dicomTagToNemaActionObject[dicomTag][5] === 'C') {
				if (dateProcessingSelect.value === 'keep') {
					continue;
				} else if (dateProcessingSelect.value === 'offset') {
					if (dicomTag in dicomDictArray[i].dict) {
						if (dicomDictArray[i].dict[dicomTag].vr === 'DA') {
							const year = parseInt(dicomDictArray[i].dict[dicomTag].Value[0].slice(0, 4));
							const month = parseInt(dicomDictArray[i].dict[dicomTag].Value[0].slice(4, 6)) - 1;
							const day = parseInt(dicomDictArray[i].dict[dicomTag].Value[0].slice(6, 8));
							const dateWithOffset = new Date(new Date(year, month, day).getTime() + sessionObject[patientId].daysOffset * 24 * 60 * 60 * 1000);
							const yearWithOffset = dateWithOffset.getFullYear();
							const monthWithOffset = (dateWithOffset.getMonth() - 1).toLocaleString('en-US', {
								minimumIntegerDigits: 2,
								useGrouping: false
							});
							const dayWithOffset = (dateWithOffset.getDay()).toLocaleString('en-US', {
								minimumIntegerDigits: 2,
								useGrouping: false
							});
							dicomDictArray[i].dict[dicomTag].Value[0] = `${yearWithOffset}${monthWithOffset}${dayWithOffset}`;
						} else if (dicomDictArray[i].dict[dicomTag].vr === 'TM') {
							const hours = dicomDictArray[i].dict[dicomTag].Value[0].slice(0, 2);
							const minutes = dicomDictArray[i].dict[dicomTag].Value[0].slice(2, 4);
							const seconds = dicomDictArray[i].dict[dicomTag].Value[0].slice(4, 6);
							const date = new Date();
							date.setHours(hours);
							date.setMinutes(minutes);
							date.setSeconds(seconds + sessionObject[patientId].secondsOffset);
							const hoursWithOffset = (date.getHours()).toLocaleString('en-US', {
								minimumIntegerDigits: 2,
								useGrouping: false
							});
							const minutesWithOffset = (date.getMinutes()).toLocaleString('en-US', {
								minimumIntegerDigits: 2,
								useGrouping: false
							});
							const secondsWithOffset = (date.getSeconds()).toLocaleString('en-US', {
								minimumIntegerDigits: 2,
								useGrouping: false
							});
							dicomDictArray[i].dict[dicomTag].Value[0] = `${hoursWithOffset}${minutesWithOffset}${secondsWithOffset}`;
							dicomTagValuesReplacedNum++;
						}
					}
					continue;
				}
			} else if (dicomTagToNemaActionObject[dicomTag][6] === 'K' && retainDescriptorsInputCheckbox.checked) {
				continue;
			} else {
				if (dicomTag in dicomDictArray[i].dict) {
					dicomDictArray[i].dict[dicomTag].Value = [];
				} else {
					for (const dicomTagUpperLevel in dicomDictArray[i].dict) {
						if (dicomDictArray[i].dict[dicomTagUpperLevel].vr === 'SQ' && dicomDictArray[i].dict[dicomTagUpperLevel].Value[0] && dicomTag in dicomDictArray[i].dict[dicomTagUpperLevel].Value[0]) {
							dicomDictArray[i].dict[dicomTagUpperLevel].Value[0][dicomTag].Value = [];
							break;
						}
					}
				}
				dicomTagValuesRemovedNum++;
			}
		}
		dicomDictArray[i].dict['00120062'] = {
			Value: ['YES'],
			vr: 'LO'
		};
		let deIdentificationMethodDicomTagValue = 'DCM:11310/';
		if (retainSafePrivateInputCheckbox.checked) {
			deIdentificationMethodDicomTagValue += '113111';
		}
		if (retainUidsInputCheckbox.checked) {
			deIdentificationMethodDicomTagValue += '/113110';
		}
		if (retainDeviceIdentityInputCheckbox.checked) {
			deIdentificationMethodDicomTagValue += '/113109';
		}
		if (retainPatientCharacteristicsInputCheckbox.checked) {
			deIdentificationMethodDicomTagValue += '/113108';
		}
		if (retainDescriptorsInputCheckbox.checked) {
			deIdentificationMethodDicomTagValue += '/113105';
		}
		if (dateProcessingSelect.value === 'keep') {
			deIdentificationMethodDicomTagValue += '/113106';
		} else if (dateProcessingSelect.value === 'offset') {
			deIdentificationMethodDicomTagValue += '/113107';
		}
		dicomDictArray[i].dict['00120063'] = {
			Value: [deIdentificationMethodDicomTagValue],
			vr: 'LO'
		};
		hashCode(JSON.stringify(dicomDictArray[i])).then((hex) => {
			let dateString = '';
			if (navigator.userAgent === 'playwright') {
				dateString = 'January 02, 2000 00:00:00';
			} else {
				const dateNow = new Date(Date.now());
				dateString = dateNow.getTime() - dateNow.getTimezoneOffset() * 60000;
			}
			const date = new Date(dateString);
			const dicomTagSavePathArray = dicomTagSavePathInputText.value.slice(0, -1).split('/');
			const dicomTagValueSavePath = dicomTagSavePathArray.map(x => dicomDictArray[i].dict[x].Value[0]).join('/') + '/';
			const dicomTagValueSavePathArray = dicomTagValueSavePath.split('/');
			for (let j = 1; j < dicomTagValueSavePathArray.length; j++) {
				zip.file(dicomTagValueSavePathArray.slice(0, j).join('/') + '/', '', {
					date: date
				});
			}
			zip.file(`${dicomTagValueSavePath}${hex}.dcm`, dicomDictArray[i].write({
				allowInvalidVRLength: true
			}), {
				date: date
			});
			filesProcessedNumSpan.textContent = `${i+1}/${filesNum}`;
			if (i === filesNum - 1) {
				dicomTagValuesRemovedNumSpan.textContent = dicomTagValuesRemovedNum;
				dicomTagValuesReplacedNumSpan.textContent = dicomTagValuesReplacedNum;
				zip.file('session.json', JSON.stringify(sessionObject), {
					date: date
				});
				zip.generateAsync({
					type: 'arraybuffer'
				}).then(function(arraybuffer) {
					saveData([arraybuffer], 'de-identified-files.zip');
					disableUI(false);
				});
			}
		});
	}
};
disableUI(true);
window.onload = function() {
	document.body.style.display = '';
};
