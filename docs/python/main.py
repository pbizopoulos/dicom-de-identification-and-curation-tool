import csv
import json
from hashlib import sha256
from pathlib import Path
from urllib import request

import pandas as pd


def main() -> None:
    with request.urlopen(  # noqa: S310
        "https://dicom.nema.org/medical/dicom/current/output/chtml/part15/chapter_e.html",
    ) as response:
        html = response.read()
    df_tables = pd.read_html(html)
    df_table = df_tables[3]
    df_table = df_table.fillna("")
    dicom_tags = df_table["Tag"].str.replace("[(,)]", "", regex=True).to_list()
    basic_profile = ["X" for i in df_table["Basic Prof."].to_list()]
    retain_safe_private_option = df_table["Rtn. Safe Priv. Opt."].to_list()
    retain_uids_option = df_table["Rtn. UIDs Opt."].to_list()
    retain_device_identity_option = df_table["Rtn. Dev. Id. Opt."].to_list()
    retain_patient_characteristics_option = [
        "K" if i == "C" else i for i in df_table["Rtn. Pat. Chars. Opt."].to_list()
    ]
    retain_long_modified_dates_option = df_table["Rtn. Long. Modif. Dates Opt."]
    retain_description_option = [
        "K" if i == "C" else i for i in df_table["Clean Desc. Opt."].to_list()
    ]
    output = [
        basic_profile,
        retain_safe_private_option,
        retain_uids_option,
        retain_device_identity_option,
        retain_patient_characteristics_option,
        retain_long_modified_dates_option,
        retain_description_option,
    ]
    output = list(map(list, zip(*output)))  # noqa: B905
    dicom_tag_to_nema_action = dict(zip(dicom_tags, output))  # noqa: B905
    dicom_tag_to_nema_action["00100010"][0] = "Z"
    dicom_tag_to_nema_action["00100020"][0] = "Z"
    file_content = (
        f"const dicomTagToNemaActionObject = {json.dumps(dicom_tag_to_nema_action)};"
    )
    with Path("dist/dicom-tag-to-nema-action.js").open("w", encoding="utf-8") as file:
        file.write(file_content)
    assert (
        sha256(file_content.encode("utf-8")).hexdigest()
        == "54dfa7ecb18b80983e18f2b3a629b588eb0c9e6f26e6c4b56026321ac4d5baaf"
    )
    with Path("tmp/dicom-tag-to-nema-action-default.csv").open(
        "w",
        encoding="utf-8",
        newline="",
    ) as file:
        writer = csv.writer(file)
        writer.writerow(["Name", "Tag", "Action"])
        dicom_tag_names = df_table["Attribute Name"].to_list()
        for (key, _), dicom_tag_name in zip(  # noqa: B905
            dicom_tag_to_nema_action.items(),
            dicom_tag_names,
        ):
            if key in ["00100010", "00100020"]:
                writer.writerow([dicom_tag_name.replace("\n", " "), key, "Z"])
            elif "C" in dicom_tag_to_nema_action[key]:
                writer.writerow([dicom_tag_name.replace("\n", " "), key, "C"])
            elif "K" not in dicom_tag_to_nema_action[key]:
                writer.writerow([dicom_tag_name.replace("\n", " "), key, "X"])


if __name__ == "__main__":
    main()
