import hashlib
from os import listdir, makedirs
from os.path import exists, isfile, join

import pydicom
from playwright.sync_api import sync_playwright
from pydicom import dcmread


def main():
    dicom_data = dcmread(pydicom.data.get_testdata_file('rtdose_1frame.dcm'))
    generated_data_file_path = join('bin', 'generated-data')
    if not exists(generated_data_file_path):
        makedirs(generated_data_file_path, exist_ok=True)
        for index in range(1000):
            dicom_data[16, 16].value = f'John Doe {index % 100}'
            dicom_data[16, 32].value = str(index % 100)
            dicom_data[32, 17].value = str(index % 5)
            dicom_data[8, 24].value = dicom_data[8, 24].value.replace(str(index % 8), str(index % 9))
            if index % 3:
                dicom_data[8, 96].value = 'CT'
            elif index % 3 == 1:
                dicom_data[8, 96].value = 'MG'
            elif index % 3 == 2:
                dicom_data[8, 96].value = 'MR'
            if index % 7:
                makedirs(join(generated_data_file_path, f'folder-{index}'), exist_ok=True)
                dicom_data.save_as(join(generated_data_file_path, f'folder-{index}', f'{index}.dcm'))
            else:
                dicom_data.save_as(join(generated_data_file_path, f'{index}.dcm'))
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(args=['--user-agent=playwright'])
        context = browser.new_context(record_video_dir='bin/')
        page = context.new_page()
        page.on('pageerror', lambda exception: (_ for _ in ()).throw(Exception(f'uncaught exception: {exception}')))
        page.goto('file:///work/docs/index.html')
        only_files_generated_data_file_path = [join(generated_data_file_path, file) for file in listdir(generated_data_file_path) if isfile(join(generated_data_file_path, file))]
        page.set_input_files('#load-directory-input-file', sorted(only_files_generated_data_file_path))
        with page.expect_download() as download_info:
            page.click('#save-processed-files-as-zip-button')
        download = download_info.value
        download.save_as(join('bin', 'de-identified-files.zip'))
        with open(join('bin', 'de-identified-files.zip'), 'rb') as file:
            assert hashlib.sha256(file.read()).hexdigest() == '6ce13d6f3754db683e9130cf7498553d80a4a6ec935143793289939f55a4645e'
        page.screenshot(path=join('bin', 'screenshot.png'))
        with open(join('bin', 'screenshot.png'), 'rb') as file:
            assert hashlib.sha256(file.read()).hexdigest() == 'b4b36f9a496c81ab42fb704d4c57344514bd7e6e23998a45bd47cade634cb01f'
        context.close()
        browser.close()


if __name__ == '__main__':
    main()
