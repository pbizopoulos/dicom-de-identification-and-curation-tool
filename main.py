from os.path import join
from playwright.sync_api import sync_playwright
from pydicom import dcmread
from shutil import rmtree
import os
import pydicom


def main():
    dicom = dcmread(pydicom.data.get_testdata_file('rtdose_1frame.dcm'))
    generated_data_file_path = join('bin', 'generated-data')
    if os.path.exists(generated_data_file_path):
        rmtree(generated_data_file_path)
    os.makedirs(generated_data_file_path, exist_ok=True)
    for index in range(1000):
        dicom[16, 16].value = f'John Doe {index % 100}'
        dicom[16, 32].value = str(index % 100)
        dicom[32, 17].value = str(index % 5)
        dicom[8, 24].value = dicom[8, 24].value.replace(str(index % 8), str(index % 9))
        if index % 3:
            dicom[8, 96].value = 'CT'
        elif index % 3 == 1:
            dicom[8, 96].value = 'MG'
        elif index % 3 == 2:
            dicom[8, 96].value = 'MR'
        if index % 7:
            os.makedirs(join(generated_data_file_path, f'folder-{index}'), exist_ok=True)
            dicom.save_as(join(generated_data_file_path, f'folder-{index}', f'{index}.dcm'))
        else:
            dicom.save_as(join(generated_data_file_path, f'{index}.dcm'))
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(args=['--user-agent=playwright'])
        page = browser.new_page()
        page.on('pageerror', lambda exception: (_ for _ in ()).throw(Exception(f'uncaught exception: {exception}')))
        page.goto('file:///work/docs/index.html')
        only_files_generated_data_file_path = [join(generated_data_file_path, file) for file in os.listdir(generated_data_file_path) if os.path.isfile(os.path.join(generated_data_file_path, file))]
        page.set_input_files('#load-directory-input-file', only_files_generated_data_file_path)
        page.screenshot(path=join('bin', 'screenshot.png'))
        with page.expect_download() as download_info:
            page.click('#save-processed-files-as-zip-button')
        download = download_info.value
        download.save_as(join('bin', 'de-identified-files.zip'))
        page.screenshot(path=join('bin', 'screenshot.png'))
        browser.close()


if __name__ == '__main__':
    main()
