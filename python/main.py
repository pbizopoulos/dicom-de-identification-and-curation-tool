import hashlib
import os
import unittest
from pathlib import Path

import pydicom
from playwright.sync_api import Error, sync_playwright
from pydicom import dcmread


class TestWebApplication(unittest.TestCase):
    def setUp(self: "TestWebApplication") -> None:
        testdata_file = pydicom.data.get_testdata_file("rtdose_1frame.dcm")
        dicom_data = dcmread(testdata_file)  # type: ignore[arg-type]
        generated_data_file_path = Path("tmp/generated-data")
        if not generated_data_file_path.exists():
            generated_data_file_path.mkdir(exist_ok=True)
            for index in range(1000):
                dicom_data[16, 16].value = f"John Doe {index % 100}"
                dicom_data[16, 32].value = str(index % 100)
                dicom_data[32, 17].value = str(index % 5)
                dicom_data[8, 24].value = dicom_data[8, 24].value.replace(
                    str(index % 8),
                    str(index % 9),
                )
                if index % 3:
                    dicom_data[8, 96].value = "CT"
                elif index % 3 == 1:
                    dicom_data[8, 96].value = "MG"
                elif index % 3 == 2:  # noqa: PLR2004
                    dicom_data[8, 96].value = "MR"
                if index % 7:
                    (generated_data_file_path / f"folder-{index}").mkdir(exist_ok=True)
                    dicom_data.save_as(
                        generated_data_file_path / f"folder-{index}" / f"{index}.dcm",
                    )
                else:
                    dicom_data.save_as(generated_data_file_path / f"{index}.dcm")
        self.only_files_generated_data_file_path = list(
            {
                generated_data_file_path / file
                for file in os.listdir(generated_data_file_path)
                if (generated_data_file_path / file).is_file()
            },
        )

    def test_web_application(self: "TestWebApplication") -> None:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(args=["--user-agent=playwright"])
            context = browser.new_context(record_video_dir="tmp/")
            page = context.new_page()
            page.on("pageerror", self.page_error)
            page.goto(
                "https://dicom-de-identification-and-curation-tool.incisive.iti.gr/",
            )
            page.set_input_files(
                "#load-directory-input-file",
                self.only_files_generated_data_file_path,
            )
            with page.expect_download() as download_info:
                page.click("#save-processed-files-as-zip-button")
            download = download_info.value
            download.save_as("tmp/de-identified-files.zip")
            with Path("tmp/de-identified-files.zip").open("rb") as file:
                if (
                    hashlib.sha256(file.read()).hexdigest()
                    != "bf40ebb18b6e4767dad94c074d301b42132ebe02004bfbc7792ff3ed4bbc5642"  # noqa: E501
                ):
                    raise AssertionError
            page.screenshot(path="tmp/screenshot.png")
            with Path("tmp/screenshot.png").open("rb") as file:
                if (
                    hashlib.sha256(file.read()).hexdigest()
                    != "07963e07e9aad3ff14ed38abbec17c4cba7df56db26938e63445a2fe997276ba"  # noqa: E501
                ):
                    raise AssertionError
            context.close()
            browser.close()

    def page_error(self: "TestWebApplication", exception: Error) -> None:
        raise exception


if __name__ == "__main__":
    unittest.main()
