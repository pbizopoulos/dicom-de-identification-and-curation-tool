'use strict';

let dicomDictArray = [];
let table = document.getElementById('myTable');

let myMap = new Map();
myMap.set('Patient Name', '00100010')
myMap.set('Patient ID', '00100020')
myMap.set('Patient Birth Date', '00100030')
myMap.set('Study Description', '00081030')
myMap.set('Protocol Name', '00181030')
myMap.set('Accession #', '00080050')
myMap.set('Study Id', '00200010')
myMap.set('Study Date', '00080020')
myMap.set('Study Time', '00080030')
myMap.set('Series Description', '0008103e')
myMap.set('Series Date', '00080021')
myMap.set('Series Time', '00080031')
myMap.set('Acquisition Date', '00080022')
myMap.set('Acquisition Time', '00080032')
myMap.set('Content Date', '00080023')
myMap.set('Content Time', '00080033')

let i = 0;
for (let [key, value] of myMap) {
	let row = table.insertRow(i);
	let cellRowName = row.insertCell(0);
	let cellOriginalValue = row.insertCell(1);
	let cellDeidentifiedValue = row.insertCell(2);
	cellRowName.innerHTML = key;
	cellOriginalValue.innerHTML = '';
	cellDeidentifiedValue.innerHTML = '';
	i++;
}

function loadFiles() {
	const files = event.currentTarget.files;
	for (let i = 0; i < files.length; i++) {
		const reader = new FileReader();
		reader.onload = function() {
			dicomDictArray[i] = dcmjs.data.DicomMessage.readFile(reader.result);
			const dataset = dcmjs.data.DicomMetaDictionary.naturalizeDataset(dicomDictArray[i].dict);
			dicomDictArray[i].dict = dcmjs.data.DicomMetaDictionary.denaturalizeDataset(dataset);
			let j = 0;
			for (let element of myMap) {
				const str = dicomDictArray[i].dict[element[1]];
				if (str !== undefined) {
					table.rows[j].cells[1].textContent = str.Value[0];
				}
				j++;
			}
			dcmjs.anonymizer.cleanTags(dicomDictArray[i].dict);
			j = 0;
			for (let element of myMap) {
				const str = dicomDictArray[i].dict[element[1]];
				if (str !== undefined) {
					table.rows[j].cells[2].textContent = str.Value[0];
				}
				j++;
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
