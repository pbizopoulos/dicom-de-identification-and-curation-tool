import csv
import json
from hashlib import sha256
from pathlib import Path

from playwright.sync_api import Error, sync_playwright


def main() -> None:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        page = browser.new_page()
        page.on('pageerror', page_error)
        page.goto('https://dicom.nema.org/medical/dicom/current/output/chtml/part15/chapter_e.html')
        children = page.query_selector_all('table')[3].query_selector_all('xpath=child::*')[1].query_selector_all('xpath=child::*')
        dicom_tags = [child.query_selector_all('td')[1].inner_text()[1:10].replace(',', '') for child in children]
        basic_profile = [child.query_selector_all('td')[4].inner_text() for child in children]
        basic_profile = ['X' for i in basic_profile]
        retain_safe_private_option = [child.query_selector_all('td')[5].inner_text() for child in children]
        retain_uids_option = [child.query_selector_all('td')[6].inner_text() for child in children]
        retain_device_identity_option = [child.query_selector_all('td')[7].inner_text() for child in children]
        retain_patient_characteristics_option = [child.query_selector_all('td')[9].inner_text() for child in children]
        retain_patient_characteristics_option = ['K' if i == 'C' else i for i in retain_patient_characteristics_option]
        retain_long_modified_dates_option = [child.query_selector_all('td')[11].inner_text() for child in children]
        retain_description_option = [child.query_selector_all('td')[12].inner_text() for child in children]
        retain_description_option = ['K' if i == 'C' else i for i in retain_description_option]
        output = [basic_profile, retain_safe_private_option, retain_uids_option, retain_device_identity_option, retain_patient_characteristics_option, retain_long_modified_dates_option, retain_description_option]
        output = list(map(list, zip(*output))) # noqa: B905
        dicom_tag_to_nema_action = dict(zip(dicom_tags, output)) # noqa: B905
        dicom_tag_to_nema_action['00100010'][0] = 'Z'
        dicom_tag_to_nema_action['00100020'][0] = 'Z'
        tmp = json.dumps(dicom_tag_to_nema_action)
        with Path('dist/dicom-tag-to-nema-action.js').open('w', encoding='utf-8') as file:
            file.write(f'const dicomTagToNemaActionObject = {tmp};')
        assert sha256(tmp.encode('utf-8')).hexdigest() == '8588ee04044b4ce7dc405c283dd7fa964961370fbffe764fb9b424df51d3b2b3'
        with Path('bin/dicom-tag-to-nema-action-default.csv').open('w', encoding='utf-8', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(['Name', 'Tag', 'Action'])
            dicom_tag_names = [child.query_selector_all('td')[0].inner_text() for child in children]
            for (key, _), dicom_tag_name in zip(dicom_tag_to_nema_action.items(), dicom_tag_names): # noqa: B905
                if key in ['00100010', '00100020']:
                    writer.writerow([dicom_tag_name.replace('\n', ' '), key, 'Z'])
                elif 'C' in dicom_tag_to_nema_action[key]:
                    writer.writerow([dicom_tag_name.replace('\n', ' '), key, 'C'])
                elif 'K' not in dicom_tag_to_nema_action[key]:
                    writer.writerow([dicom_tag_name.replace('\n', ' '), key, 'X'])
        browser.close()


def page_error(exception: Error) -> None:
    raise exception


if __name__ == '__main__':
    main()
