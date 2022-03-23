'use strict';

const spanImageIndex = document.getElementById('spanImageIndex');
const inputRangeFileIndex = document.getElementById('inputRangeFileIndex');
const dicomTagArray = [
    // please override these in specificReplaceDefaults to have useful values
    'PatientID',
    'PatientName',
    // 0/3: those that appear missing in CTP
    'SeriesDate',
    'AccessionNumber',
    // (valuable, but sometimes manually filled)
    'SeriesDescription',
    // cat 1/3: CTP: set to empty explicitely using @empty
    'StudyTime',
    'ContentTime',
    'ReferringPhysicianName',
    'PatientBirthDate',
    'PatientSex',
    'ClinicalTrialSiteID',
    'ClinicalTrialSiteName',
    'ClinicalTrialSubjectID',
    'ClinicalTrialSubjectReadingID',
    'ClinicalTrialTimePointID',
    'ClinicalTrialTimePointDescription',
    'ContrastBolusAgent',
    'StudyID',
    // cat 2/3: CTP: set to increment dates
    'InstanceCreationDate',
    'StudyDate',
    'ContentDate',
    'DateOfSecondaryCapture',
    'DateOfLastCalibration',
    'DateOfLastDetectorCalibration',
    'FrameAcquisitionDatetime',
    'FrameReferenceDatetime',
    'StudyVerifiedDate',
    'StudyReadDate',
    'ScheduledStudyStartDate',
    'ScheduledStudyStopDate',
    'StudyArrivalDate',
    'StudyCompletionDate',
    'ScheduledAdmissionDate',
    'ScheduledDischargeDate',
    'DischargeDate',
    'SPSStartDate',
    'SPSEndDate',
    'PPSStartDate',
    'PPSEndDate',
    'IssueDateOfImagingServiceRequest',
    'VerificationDateTime',
    'ObservationDateTime',
    'DateTime',
    'Date',
    'RefDatetime',
    // cat 3/3: CTP: set to remove using @remove
    'AcquisitionDate',
    'OverlayDate',
    'CurveDate',
    'AcquisitionDatetime',
    'SeriesTime',
    'AcquisitionTime',
    'OverlayTime',
    'CurveTime',
    'InstitutionName',
    'InstitutionAddress',
    'ReferringPhysicianAddress',
    'ReferringPhysicianPhoneNumbers',
    'ReferringPhysiciansIDSeq',
    'TimezoneOffsetFromUTC',
    'StationName',
    'StudyDescription',
    'InstitutionalDepartmentName',
    'PhysicianOfRecord',
    'PhysicianOfRecordIdSeq',
    'PerformingPhysicianName',
    'PerformingPhysicianIdSeq',
    'NameOfPhysicianReadingStudy',
    'PhysicianReadingStudyIdSeq',
    'OperatorName',
    'OperatorsIdentificationSeq',
    'AdmittingDiagnosisDescription',
    'AdmittingDiagnosisCodeSeq',
    'RefStudySeq',
    'RefPPSSeq',
    'RefPatientSeq',
    'RefImageSeq',
    'DerivationDescription',
    'SourceImageSeq',
    'IdentifyingComments',
    'IssuerOfPatientID',
    'PatientBirthTime',
    'PatientInsurancePlanCodeSeq',
    'PatientPrimaryLanguageCodeSeq',
    'PatientPrimaryLanguageModifierCodeSeq',
    'OtherPatientIDs',
    'OtherPatientNames',
    'OtherPatientIDsSeq',
    'PatientBirthName',
    'PatientAge',
    'PatientSize',
    'PatientWeight',
    'PatientAddress',
    'InsurancePlanIdentification',
    'PatientMotherBirthName',
    'MilitaryRank',
    'BranchOfService',
    'MedicalRecordLocator',
    'MedicalAlerts',
    'ContrastAllergies',
    'CountryOfResidence',
    'RegionOfResidence',
    'PatientPhoneNumbers',
    'EthnicGroup',
    'Occupation',
    'SmokingStatus',
    'AdditionalPatientHistory',
    'PregnancyStatus',
    'LastMenstrualDate',
    'PatientReligiousPreference',
    'PatientSexNeutered',
    'ResponsiblePerson',
    'ResponsibleOrganization',
    'PatientComments',
    'DeviceSerialNumber',
    'PlateID',
    'GeneratorID',
    'CassetteID',
    'GantryID',
    // we keep - should be SoftwareVersions anyway
    // 'SoftwareVersion',
    'ProtocolName',
    'AcquisitionDeviceProcessingDescription',
    'AcquisitionComments',
    'DetectorID',
    'AcquisitionProtocolDescription',
    'ContributionDescription',
    'ModifyingDeviceID',
    'ModifyingDeviceManufacturer',
    'ModifiedImageDescription',
    'ImageComments',
    'ImagePresentationComments',
    'StudyIDIssuer',
    'ScheduledStudyLocation',
    'ScheduledStudyLocationAET',
    'ReasonforStudy',
    'RequestingPhysician',
    'RequestingService',
    'RequestedProcedureDescription',
    'RequestedContrastAgent',
    'StudyComments',
    'AdmissionID',
    'IssuerOfAdmissionID',
    'ScheduledPatientInstitutionResidence',
    'AdmittingDate',
    'AdmittingTime',
    'DischargeDiagnosisDescription',
    'SpecialNeeds',
    'ServiceEpisodeID',
    'IssuerOfServiceEpisodeId',
    'ServiceEpisodeDescription',
    'CurrentPatientLocation',
    'PatientInstitutionResidence',
    'PatientState',
    'ReferencedPatientAliasSeq',
    'VisitComments',
    'ScheduledStationAET',
    'ScheduledPerformingPhysicianName',
    'SPSDescription',
    'ScheduledStationName',
    'SPSLocation',
    'PreMedication',
    'PerformedStationAET',
    'PerformedStationName',
    'PerformedLocation',
    'PerformedStationNameCodeSeq',
    'PPSID',
    'PPSDescription',
    'RequestAttributesSeq',
    'PPSComments',
    'AcquisitionContextSeq',
    'PatientTransportArrangements',
    'RequestedProcedureLocation',
    'NamesOfIntendedRecipientsOfResults',
    'IntendedRecipientsOfResultsIDSequence',
    'PersonAddress',
    'PersonTelephoneNumbers',
    'RequestedProcedureComments',
    'ReasonForTheImagingServiceRequest',
    'OrderEnteredBy',
    'OrderEntererLocation',
    'OrderCallbackPhoneNumber',
    'ImagingServiceRequestComments',
    'ConfidentialityPatientData',
    'ScheduledStationNameCodeSeq',
    'ScheduledStationGeographicLocCodeSeq',
    'PerformedStationGeoLocCodeSeq',
    'ScheduledHumanPerformersSeq',
    'ActualHumanPerformersSequence',
    'HumanPerformersOrganization',
    'HumanPerformersName',
    'VerifyingOrganization',
    'VerifyingObserverName',
    'AuthorObserverSequence',
    'ParticipantSequence',
    'CustodialOrganizationSeq',
    'VerifyingObserverIdentificationCodeSeq',
    'PersonName',
    'ContentSeq',
    'OverlayData',
    'OverlayComments',
    'IconImageSequence',
    'TopicSubject',
    'TopicAuthor',
    'TopicKeyWords',
    'TextString',
    'Arbitrary',
    'TextComments',
    'ResultsIDIssuer',
    'InterpretationRecorder',
    'InterpretationTranscriber',
    'InterpretationText',
    'InterpretationAuthor',
    'InterpretationApproverSequence',
    'PhysicianApprovingInterpretation',
    'InterpretationDiagnosisDescription',
    'ResultsDistributionListSeq',
    'DistributionName',
    'DistributionAddress',
    'InterpretationIdIssuer',
    'Impressions',
    'ResultComments',
    'DigitalSignaturesSeq',
    'DataSetTrailingPadding'
];

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
		datasetAfterAnonymizationArray[fileIndex][dicomTag] = dicomTagValueTable.rows[j].cells[3].textContent;
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
		let cellDICOMTag = row.insertCell(1);
		let cellOriginalValue = row.insertCell(2);
		let cellDeidentifiedValue = row.insertCell(3);
		let cellGlobalApplyDeidentifiedValue = row.insertCell(4);
		cellRowName.textContent = dicomTag;
		cellRowName.style = 'border:1px solid;';
		const currentTag = dcmjs.data.DicomMetaDictionary.nameMap[dicomTag];
		if (currentTag) {
			cellDICOMTag.textContent = currentTag.tag;
		}
		cellDICOMTag.style = 'border:solid;';
		cellOriginalValue.textContent = '';
		cellOriginalValue.style = 'border:1px solid;';
		cellDeidentifiedValue.textContent = '';
		cellDeidentifiedValue.style = 'border:solid;';
		cellDeidentifiedValue.contentEditable = true;
		cellGlobalApplyDeidentifiedValue.textContent = 'Apply global';
		cellGlobalApplyDeidentifiedValue.style = 'background-color:#D3D3D3;border:solid;';
		cellGlobalApplyDeidentifiedValue.addEventListener('click',function(){
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
		dicomTagValueTable.rows[j].cells[2].textContent = datasetBeforeAnonymizationArray[fileIndex][dicomTag];
		dicomTagValueTable.rows[j].cells[3].textContent = datasetAfterAnonymizationArray[fileIndex][dicomTag];
	}
}

resetTable();
