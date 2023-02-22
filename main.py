from hashlib import sha256
from os import listdir
from pathlib import Path

import pydicom
from playwright.sync_api import sync_playwright
from pydicom import dcmread


def main() -> None:
    dicom_data = dcmread(pydicom.data.get_testdata_file('rtdose_1frame.dcm')) # type: ignore[arg-type]
    generated_data_file_path = Path('bin/generated-data')
    if not generated_data_file_path.exists():
        generated_data_file_path.mkdir(exist_ok=True)
        for index in range(1000):
            dicom_data[16, 16].value = f'John Doe {index % 100}'
            dicom_data[16, 32].value = str(index % 100)
            dicom_data[32, 17].value = str(index % 5)
            dicom_data[8, 24].value = dicom_data[8, 24].value.replace(str(index % 8), str(index % 9))
            if index % 3:
                dicom_data[8, 96].value = 'CT'
            elif index % 3 == 1:
                dicom_data[8, 96].value = 'MG'
            elif index % 3 == 2: # noqa: PLR2004
                dicom_data[8, 96].value = 'MR'
            if index % 7:
                (generated_data_file_path / f'folder-{index}').mkdir(exist_ok=True)
                dicom_data.save_as(generated_data_file_path / f'folder-{index}' / f'{index}.dcm')
            else:
                dicom_data.save_as(generated_data_file_path / f'{index}.dcm')
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(args=['--user-agent=playwright'])
        context = browser.new_context(record_video_dir='bin/')
        page = context.new_page()
        page.on('pageerror', lambda exception: print(f'uncaught exception: {exception}')) # noqa: T201
        page.goto('file:///usr/src/app/docs/index.html')
        only_files_generated_data_file_path = [generated_data_file_path / file for file in listdir(generated_data_file_path) if (generated_data_file_path / file).is_file()]
        page.set_input_files('#load-directory-input-file', sorted(only_files_generated_data_file_path))
        with page.expect_download() as download_info:
            page.click('#save-processed-files-as-zip-button')
        download = download_info.value
        download.save_as('bin/de-identified-files.zip')
        with Path('bin/de-identified-files.zip').open('rb') as file:
            assert sha256(file.read()).hexdigest() == '6ce13d6f3754db683e9130cf7498553d80a4a6ec935143793289939f55a4645e'
        page.screenshot(path='bin/screenshot.png')
        with Path('bin/screenshot.png').open('rb') as file:
            assert sha256(file.read()).hexdigest() == '6c6c4e491768a3b117f89306eee84aea0a3dd82c426f36df6948cd73fa430f9f'
        context.close()
        browser.close()


if __name__ == '__main__':
    main()
