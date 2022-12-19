from os.path import join
from playwright.sync_api import sync_playwright
import csv
import hashlib
import json


def main():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        page = browser.new_page()
        page.on('pageerror', lambda exception: (_ for _ in ()).throw(Exception(f'uncaught exception: {exception}')))
        page.goto('https://dicom.nema.org/medical/dicom/current/output/chtml/part15/chapter_e.html')
        child_list = page.query_selector_all('table')[3].query_selector_all('xpath=child::*')[1].query_selector_all('xpath=child::*')
        dicom_tag_list = [child.query_selector_all('td')[1].inner_text()[1:10].replace(',', '') for child in child_list]
        basic_profile_list = [child.query_selector_all('td')[4].inner_text() for child in child_list]
        basic_profile_list = ['X' for basic_profile in basic_profile_list]
        retain_safe_private_option_list = [child.query_selector_all('td')[5].inner_text() for child in child_list]
        retain_uids_option_list = [child.query_selector_all('td')[6].inner_text() for child in child_list]
        retain_device_identity_option_list = [child.query_selector_all('td')[7].inner_text() for child in child_list]
        retain_patient_characteristics_option_list = [child.query_selector_all('td')[9].inner_text() for child in child_list]
        retain_patient_characteristics_option_list = ['K' if retain_patient_characteristics_option == 'C' else retain_patient_characteristics_option for retain_patient_characteristics_option in retain_patient_characteristics_option_list]
        retain_long_modified_dates_option_list = [child.query_selector_all('td')[11].inner_text() for child in child_list]
        retain_description_option_list = [child.query_selector_all('td')[12].inner_text() for child in child_list]
        retain_description_option_list = ['K' if retain_description_option == 'C' else retain_description_option for retain_description_option in retain_description_option_list]
        output = [basic_profile_list, retain_safe_private_option_list, retain_uids_option_list, retain_device_identity_option_list, retain_patient_characteristics_option_list, retain_long_modified_dates_option_list, retain_description_option_list]
        output = list(map(list, zip(*output)))
        dicom_tag_to_nema_action_dict = dict(zip(dicom_tag_list, output))
        dicom_tag_to_nema_action_dict['00100010'][0] = 'Z'
        dicom_tag_to_nema_action_dict['00100020'][0] = 'Z'
        with open(join('dist', 'dicom-tag-to-nema-action.js'), 'w', encoding='utf-8') as file:
            file.write(f'const dicomTagToNemaActionObject = {json.dumps(dicom_tag_to_nema_action_dict)};')
        with open(join('bin', 'dicom-tag-to-nema-action-default.csv'), 'w', encoding='utf-8', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(['Name', 'Tag', 'Action'])
            dicom_tag_name_list = [child.query_selector_all('td')[0].inner_text() for child in child_list]
            for (key, value), dicom_tag_name in zip(dicom_tag_to_nema_action_dict.items(), dicom_tag_name_list):
                if key == '00100010':
                    writer.writerow([dicom_tag_name.replace('\n', ' '), key, 'Z'])
                elif key == '00100020':
                    writer.writerow([dicom_tag_name.replace('\n', ' '), key, 'Z'])
                elif 'C' in dicom_tag_to_nema_action_dict[key]:
                    writer.writerow([dicom_tag_name.replace('\n', ' '), key, 'C'])
                elif 'K' not in dicom_tag_to_nema_action_dict[key]:
                    writer.writerow([dicom_tag_name.replace('\n', ' '), key, 'X'])
        with open(join('dist', 'dicom-tag-to-nema-action.js'), 'rb') as file:
            assert hashlib.sha256(file.read()).hexdigest() == '77ab62f0b43fb04df6e6058e5f20c97a6c799928de261d75645ef65f822b0c14'
        browser.close()


if __name__ == '__main__':
    main()
