'use strict';
const dateProcessingSelect = document.getElementById('date-processing-select');
const dicomTagSavePathInputText = document.getElementById('dicom-tag-save-path-input-text');
const dicomTagValuesRemovedNumSpan = document.getElementById('dicom-tag-values-removed-num-span');
const dicomTagValuesReplacedNumSpan = document.getElementById('dicom-tag-values-replaced-num-span');
const filesProcessedNumSpan = document.getElementById('files-processed-num-span');
const loadDirectoryInputFile = document.getElementById('load-directory-input-file');
const loadSessionInputFile = document.getElementById('load-session-input-file');
const nemaModifiedTableObject = JSON.parse(nemaModifiedTableString);
const patientPseudoIdPrefixInputText = document.getElementById('patient-pseudo-id-prefix-input-text');
const retainDescriptionsInputCheckbox = document.getElementById('retain-descriptions-input-checkbox');
const retainPatientCharacteristicsInputCheckbox = document.getElementById('retain-patient-characteristics-input-checkbox');
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
	retainDescriptionsInputCheckbox.disabled = argument;
	retainPatientCharacteristicsInputCheckbox.disabled = argument;
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
	let dateString = '';
	if (navigator.userAgent === 'playwright') {
		dateString = 'January 02, 2000 00:00:00';
	} else {
		const dateNow = new Date(Date.now());
		dateString = dateNow.getTime() - dateNow.getTimezoneOffset() * 60000;
	}
	const date = new Date(dateString);
	let dicomTagValuesRemovedNum = 0;
	let dicomTagValuesReplacedNum = 0;
	const dicomTagPatientId = '00100020';
	const dicomTagPatientName = '00100010';
	for (let i = 0; i < filesNum; i++) {
		try {
			dicomDictArray[i] = dcmjs.data.DicomMessage.readFile(fileReaderArray[i]);
		} catch (e) {
			console.log(e);
			continue;
		}
		let patientId;
		if (dicomTagPatientId in dicomDictArray[i].dict) {
			patientId = dicomDictArray[i].dict[dicomTagPatientId].Value[0];
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
					patientPseudoId: `${patientPseudoIdPrefixInputText.value}${patientPseudoIdBase}`,
					daysOffset: daysOffset,
					secondsOffset: secondsOffset
				};
			}
			dicomDictArray[i].dict[dicomTagPatientId].Value[0] = sessionObject[patientId].patientPseudoId;
			dicomTagValuesReplacedNum++;
			dicomDictArray[i].dict[dicomTagPatientName].Value[0] = dicomDictArray[i].dict[dicomTagPatientId].Value[0];
			dicomTagValuesReplacedNum++;
		}
		for (const property in nemaModifiedTableObject) {
			if (property === dicomTagPatientId) {
				continue;
			} else if (property === dicomTagPatientName) {
				continue;
			} else if (nemaModifiedTableObject[property][1] === 'K' && retainUidsInputCheckbox.checked) {
				continue;
			} else if (nemaModifiedTableObject[property][2] === 'K' && retainPatientCharacteristicsInputCheckbox.checked) {
				continue;
			} else if (nemaModifiedTableObject[property][3] === 'C') {
				if (dateProcessingSelect.value === 'keep') {
					continue;
				} else if (dateProcessingSelect.value === 'offset') {
					if (property in dicomDictArray[i].dict) {
						if (dicomDictArray[i].dict[property].vr === 'DA') {
							const year = parseInt(dicomDictArray[i].dict[property].Value[0].slice(0, 4));
							const month = parseInt(dicomDictArray[i].dict[property].Value[0].slice(4, 6)) - 1;
							const day = parseInt(dicomDictArray[i].dict[property].Value[0].slice(6, 8));
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
							dicomDictArray[i].dict[property].Value[0] = `${yearWithOffset}${monthWithOffset}${dayWithOffset}`;
						} else if (dicomDictArray[i].dict[property].vr === 'TM') {
							const hours = dicomDictArray[i].dict[property].Value[0].slice(0, 2);
							const minutes = dicomDictArray[i].dict[property].Value[0].slice(2, 4);
							const seconds = dicomDictArray[i].dict[property].Value[0].slice(4, 6);
							const hoursMinutesSecondsDate = new Date();
							hoursMinutesSecondsDate.setHours(hours);
							hoursMinutesSecondsDate.setMinutes(minutes);
							hoursMinutesSecondsDate.setSeconds(seconds + sessionObject[patientId].secondsOffset);
							const hoursWithOffset = (hoursMinutesSecondsDate.getHours()).toLocaleString('en-US', {
								minimumIntegerDigits: 2,
								useGrouping: false
							});
							const minutesWithOffset = (hoursMinutesSecondsDate.getMinutes()).toLocaleString('en-US', {
								minimumIntegerDigits: 2,
								useGrouping: false
							});
							const secondsWithOffset = (hoursMinutesSecondsDate.getSeconds()).toLocaleString('en-US', {
								minimumIntegerDigits: 2,
								useGrouping: false
							});
							dicomDictArray[i].dict[property].Value[0] = `${hoursWithOffset}${minutesWithOffset}${secondsWithOffset}`;
							dicomTagValuesReplacedNum++;
						}
					}
					continue;
				}
			} else if (nemaModifiedTableObject[property][4] === 'K' && retainDescriptionsInputCheckbox.checked) {
				continue;
			} else {
				if (property in dicomDictArray[i].dict) {
					dicomDictArray[i].dict[property].Value = [];
				} else {
					for (let dicomTagUpperLevel in dicomDictArray[i].dict) {
						if (dicomDictArray[i].dict[dicomTagUpperLevel].vr === 'SQ' && dicomDictArray[i].dict[dicomTagUpperLevel].Value[0] && property in dicomDictArray[i].dict[dicomTagUpperLevel].Value[0]) {
							dicomDictArray[i].dict[dicomTagUpperLevel].Value[0][property].Value = [];
							break;
						}
					}
				}
				dicomTagValuesRemovedNum++;
			}
		}
		hashCode(JSON.stringify(dicomDictArray[i])).then((hex) => {
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
