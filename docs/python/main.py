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
        nema_modified_table_dict = dict(zip(dicom_tag_list, output))
        nema_modified_table_dict['00100010'][0] = 'Z'
        nema_modified_table_dict['00100020'][0] = 'Z'
        with open(join('dist', 'nema-modified-table.js'), 'w', encoding='utf-8') as file:
            file.write(f'const nemaModifiedTableObject = {json.dumps(nema_modified_table_dict)};')
        with open(join('bin', 'nema-modified-table-default.csv'), 'w', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerow(['Tag', 'Action'])
            for key, value in nema_modified_table_dict.items():
                if key == '00100010':
                    writer.writerow([key, 'Z'])
                elif key == '00100020':
                    writer.writerow([key, 'Z'])
                elif 'C' in nema_modified_table_dict[key]:
                    writer.writerow([key, 'C'])
                elif 'K' not in nema_modified_table_dict[key]:
                    writer.writerow([key, 'X'])
        with open(join('dist', 'nema-modified-table.js'), 'rb') as file:
            assert hashlib.sha256(file.read()).hexdigest() == '903f0c62874269f1ffbe5990f943a18ae55c51ad1ff446543ebf784aefc62434'
        browser.close()


if __name__ == '__main__':
    main()
