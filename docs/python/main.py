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
        timeout = 100000
        page.set_default_navigation_timeout(timeout)
        page.set_default_timeout(timeout)
        page.goto('https://dicom.nema.org/medical/dicom/current/output/chtml/part15/chapter_e.html')
        child_list = page.query_selector_all('table')[3].query_selector_all('xpath=child::*')[1].query_selector_all('xpath=child::*')
        dicom_tag_list = [child.query_selector_all('td')[1].inner_text()[1:10].replace(',', '') for child in child_list]
        basic_profile_list = [child.query_selector_all('td')[4].inner_text() for child in child_list]
        basic_profile_list = ['X' for basic_profile in basic_profile_list]
        retain_uids_option_list = [child.query_selector_all('td')[6].inner_text() for child in child_list]
        retain_patient_characteristics_option_list = [child.query_selector_all('td')[9].inner_text() for child in child_list]
        retain_patient_characteristics_option_list = ['K' if retain_patient_characteristics_option == 'C' else retain_patient_characteristics_option for retain_patient_characteristics_option in retain_patient_characteristics_option_list]
        retain_long_modified_dates_option_list = [child.query_selector_all('td')[11].inner_text() for child in child_list]
        retain_description_option_list = [child.query_selector_all('td')[12].inner_text() for child in child_list]
        retain_description_option_list = ['K' if retain_description_option == 'C' else retain_description_option for retain_description_option in retain_description_option_list]
        output = [basic_profile_list, retain_uids_option_list, retain_patient_characteristics_option_list, retain_long_modified_dates_option_list, retain_description_option_list]
        output = list(map(list, zip(*output)))
        nema_modified_table_dict = dict(zip(dicom_tag_list, output))
        nema_modified_table_dict['00100010'][0] = 'Z'
        nema_modified_table_dict['00100020'][0] = 'Z'
        with open('dist/nema-modified-table.js', 'w') as file:
            file.write(f'const nemaModifiedTableObject = {json.dumps(nema_modified_table_dict)};')
        with open('bin/nema-modified-table-default.csv', 'w') as file:
            writer = csv.writer(file)
            writer.writerow(['Tag', 'Action'])
            for key, value in nema_modified_table_dict.items():
                if 'C' in nema_modified_table_dict[key]:
                    writer.writerow([key, 'C'])
                elif 'K' not in nema_modified_table_dict[key]:
                    writer.writerow([key, 'X'])
        page.screenshot(path=join('bin', 'screenshot.png'))
        with open(join('bin', 'screenshot.png'), 'rb') as file:
            assert hashlib.sha256(file.read()).hexdigest() == '931a6ebc09cafcfcdd4dce427eafc17b68bd4a26ea0e154b587eb4d09a1c6e75'
        browser.close()


if __name__ == '__main__':
    main()