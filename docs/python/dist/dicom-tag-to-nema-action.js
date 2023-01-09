const dicomTagToNemaActionObject = {"00080050": ["X", "", "", "", "", "", ""], "00184000": ["X", "", "", "", "", "", "K"], "00400555": ["X", "", "", "", "", "", ""], "00080022": ["X", "", "", "", "", "C", ""], "0008002A": ["X", "", "", "", "", "C", ""], "00181400": ["X", "", "", "", "", "", "K"], "001811BB": ["X", "", "", "", "", "", "K"], "00189424": ["X", "", "", "", "", "", "K"], "00080032": ["X", "", "", "", "", "C", ""], "00080017": ["X", "", "K", "", "", "", ""], "00404035": ["X", "", "", "", "", "", ""], "001021B0": ["X", "", "", "", "", "", "K"], "0040A353": ["X", "", "", "", "", "", ""], "00380010": ["X", "", "", "", "", "", ""], "00380020": ["X", "", "", "", "", "C", ""], "00081084": ["X", "", "", "", "", "", "K"], "00081080": ["X", "", "", "", "", "", "K"], "00380021": ["X", "", "", "", "", "C", ""], "00001000": ["X", "", "K", "", "", "", ""], "00102110": ["X", "", "", "", "K", "", "K"], "006A0006": ["X", "", "", "", "", "", "K"], "006A0005": ["X", "", "", "", "", "", "K"], "006A0003": ["X", "", "K", "", "", "", ""], "00440004": ["X", "", "", "", "", "C", ""], "40000010": ["X", "", "", "", "", "", ""], "00440104": ["X", "", "", "", "", "C", ""], "00440105": ["X", "", "", "", "", "C", ""], "04000562": ["X", "", "", "", "", "C", ""], "0040A078": ["X", "", "", "", "", "", ""], "22000005": ["X", "", "", "", "", "", ""], "300A00C3": ["X", "", "", "", "", "", "K"], "300C0127": ["X", "", "", "K", "", "C", ""], "300A00DD": ["X", "", "", "", "", "", "K"], "00101081": ["X", "", "", "", "", "", ""], "0014407E": ["X", "", "", "K", "", "C", ""], "00181203": ["X", "", "", "K", "", "C", ""], "0014407C": ["X", "", "", "K", "", "C", ""], "0016004D": ["X", "", "", "", "", "", ""], "00181007": ["X", "", "", "K", "", "", ""], "04000115": ["X", "", "", "", "", "", ""], "04000310": ["X", "", "", "", "", "C", ""], "00120060": ["X", "", "", "", "", "", ""], "00120082": ["X", "", "", "", "", "", ""], "00120081": ["X", "", "", "", "", "", ""], "00120020": ["X", "", "", "", "", "", ""], "00120021": ["X", "", "", "", "", "", ""], "00120072": ["X", "", "", "", "", "", "K"], "00120071": ["X", "", "", "", "", "", ""], "00120030": ["X", "", "", "", "", "", ""], "00120031": ["X", "", "", "", "", "", ""], "00120010": ["X", "", "", "", "", "", ""], "00120040": ["X", "", "", "", "", "", ""], "00120042": ["X", "", "", "", "", "", ""], "00120051": ["X", "", "", "", "", "", "K"], "00120050": ["X", "", "", "", "", "", ""], "00400310": ["X", "", "", "", "", "", "K"], "00400280": ["X", "", "", "", "", "", "K"], "300A02EB": ["X", "", "", "", "", "", "K"], "00209161": ["X", "", "K", "", "", "", ""], "3010000F": ["X", "", "", "", "", "", "K"], "30100017": ["X", "", "", "", "", "", "K"], "30100006": ["X", "", "K", "", "", "", ""], "00403001": ["X", "", "", "", "", "", ""], "30100013": ["X", "", "K", "", "", "", ""], "0008009C": ["X", "", "", "", "", "", ""], "0008009D": ["X", "", "", "", "", "", ""], "0050001B": ["X", "", "", "", "", "", ""], "0040051A": ["X", "", "", "", "", "", "K"], "00400512": ["X", "", "", "", "", "", ""], "00700086": ["X", "", "", "", "", "", ""], "00700084": ["X", "", "", "", "", "", ""], "00080023": ["X", "", "", "", "", "C", ""], "0040A730": ["X", "", "", "", "", "", ""], "00080033": ["X", "", "", "", "", "C", ""], "00080107": ["X", "", "", "", "", "C", ""], "00080106": ["X", "", "", "", "", "C", ""], "00180010": ["X", "", "", "", "", "", "K"], "00181042": ["X", "", "", "", "", "C", ""], "00181043": ["X", "", "", "", "", "C", ""], "0018A002": ["X", "", "", "", "", "C", ""], "0018A003": ["X", "", "", "", "", "", "K"], "00102150": ["X", "", "", "", "", "", ""], "21000040": ["X", "", "", "", "", "C", ""], "21000050": ["X", "", "", "", "", "C", ""], "0040A307": ["X", "", "", "", "", "", ""], "00380300": ["X", "", "", "", "", "", ""], "50xxxxxx": ["X", "", "", "", "", "", ""], "00080025": ["X", "", "", "", "", "C", ""], "00080035": ["X", "", "", "", "", "C", ""], "0040A07C": ["X", "", "", "", "", "", ""], "FFFCFFFC": ["X", "", "", "", "", "", ""], "0040A121": ["X", "", "", "", "", "C", ""], "0040A110": ["X", "", "", "", "", "C", ""], "00181200": ["X", "", "", "K", "", "C", ""], "0018700C": ["X", "", "", "K", "", "C", ""], "00181012": ["X", "", "", "", "", "C", ""], "0040A120": ["X", "", "", "", "", "C", ""], "00181202": ["X", "", "", "K", "", "C", ""], "00189701": ["X", "", "", "", "", "C", ""], "0018937F": ["X", "", "", "", "", "", "K"], "00082111": ["X", "", "", "", "", "", "K"], "21000140": ["X", "", "", "C", "", "", ""], "0018700A": ["X", "", "", "K", "", "", ""], "3010001B": ["X", "", "", "", "", "", ""], "00500020": ["X", "", "", "K", "", "", ""], "3010002D": ["X", "", "", "K", "", "", ""], "00181000": ["X", "", "", "K", "", "", ""], "0016004B": ["X", "", "", "", "", "", "K"], "00181002": ["X", "", "K", "K", "", "", ""], "04000105": ["X", "", "", "", "", "C", ""], "FFFAFFFA": ["X", "", "", "", "", "", ""], "04000100": ["X", "", "", "", "", "", ""], "00209164": ["X", "", "K", "", "", "", ""], "00380030": ["X", "", "", "", "", "C", ""], "00380040": ["X", "", "", "", "", "", "K"], "00380032": ["X", "", "", "", "", "C", ""], "300A079A": ["X", "", "", "", "", "", "K"], "4008011A": ["X", "", "", "", "", "", ""], "40080119": ["X", "", "", "", "", "", ""], "300A0016": ["X", "", "", "", "", "", "K"], "300A0013": ["X", "", "K", "", "", "", ""], "3010006E": ["X", "", "K", "", "", "", ""], "00686226": ["X", "", "", "", "", "C", ""], "00420011": ["X", "", "", "", "", "", ""], "00189517": ["X", "", "", "", "", "C", ""], "30100037": ["X", "", "", "", "", "", "K"], "30100035": ["X", "", "", "", "", "", "K"], "30100038": ["X", "", "", "", "", "", "K"], "30100036": ["X", "", "", "", "", "", "K"], "300A0676": ["X", "", "", "", "", "", "K"], "00120087": ["X", "", "", "", "", "C", ""], "00120086": ["X", "", "", "", "", "C", ""], "00102160": ["X", "", "", "", "K", "", ""], "00189804": ["X", "", "", "", "", "C", ""], "00404011": ["X", "", "", "", "", "C", ""], "00080058": ["X", "", "K", "", "", "", ""], "0070031A": ["X", "", "K", "", "", "", ""], "00402017": ["X", "", "", "", "", "", ""], "003A032B": ["X", "", "", "", "", "", "K"], "0040A023": ["X", "", "", "", "", "C", ""], "0040A024": ["X", "", "", "", "", "C", ""], "30080054": ["X", "", "", "", "", "C", ""], "300A0196": ["X", "", "", "", "", "", "K"], "00340002": ["X", "", "", "", "", "", ""], "00340001": ["X", "", "", "", "", "", ""], "3010007F": ["X", "", "", "", "", "", "K"], "300A0072": ["X", "", "", "", "", "", "K"], "00189074": ["X", "", "", "", "", "C", ""], "00209158": ["X", "", "", "", "", "", "K"], "00200052": ["X", "", "K", "", "", "", ""], "00340007": ["X", "", "", "", "", "C", ""], "00189151": ["X", "", "", "", "", "C", ""], "00189623": ["X", "", "", "", "", "C", ""], "00181008": ["X", "", "", "K", "", "", ""], "00181005": ["X", "", "", "K", "", "", ""], "00160076": ["X", "", "", "", "", "", ""], "00160075": ["X", "", "", "", "", "", ""], "0016008C": ["X", "", "", "", "", "", ""], "0016008D": ["X", "", "", "", "", "C", ""], "00160088": ["X", "", "", "", "", "", ""], "00160087": ["X", "", "", "", "", "", ""], "0016008A": ["X", "", "", "", "", "", ""], "00160089": ["X", "", "", "", "", "", ""], "00160084": ["X", "", "", "", "", "", ""], "00160083": ["X", "", "", "", "", "", ""], "00160086": ["X", "", "", "", "", "", ""], "00160085": ["X", "", "", "", "", "", ""], "0016008E": ["X", "", "", "", "", "", ""], "0016007B": ["X", "", "", "", "", "", ""], "00160081": ["X", "", "", "", "", "", ""], "00160080": ["X", "", "", "", "", "", ""], "00160072": ["X", "", "", "", "", "", ""], "00160071": ["X", "", "", "", "", "", ""], "00160074": ["X", "", "", "", "", "", ""], "00160073": ["X", "", "", "", "", "", ""], "00160082": ["X", "", "", "", "", "", ""], "0016007A": ["X", "", "", "", "", "", ""], "0016008B": ["X", "", "", "", "", "", ""], "00160078": ["X", "", "", "", "", "", ""], "0016007D": ["X", "", "", "", "", "", ""], "0016007C": ["X", "", "", "", "", "", ""], "00160079": ["X", "", "", "", "", "", ""], "00160077": ["X", "", "", "", "", "", ""], "0016007F": ["X", "", "", "", "", "", ""], "0016007E": ["X", "", "", "", "", "", ""], "00160070": ["X", "", "", "", "", "", ""], "00700001": ["X", "", "", "", "", "", ""], "0072000A": ["X", "", "", "", "", "C", ""], "0040E004": ["X", "", "", "", "", "C", ""], "00404037": ["X", "", "", "", "", "", ""], "00404036": ["X", "", "", "", "", "", ""], "00880200": ["X", "", "", "", "", "", ""], "00084000": ["X", "", "", "", "", "", "K"], "00204000": ["X", "", "", "", "", "", "K"], "00284000": ["X", "", "", "", "", "", ""], "00402400": ["X", "", "", "", "", "", "K"], "003A0314": ["X", "", "", "", "", "C", ""], "40080300": ["X", "", "", "", "", "", "K"], "00686270": ["X", "", "", "", "", "C", ""], "00080015": ["X", "", "", "", "", "C", ""], "00080012": ["X", "", "", "", "", "C", ""], "00080013": ["X", "", "", "", "", "C", ""], "00080014": ["X", "", "K", "", "", "", ""], "04000600": ["X", "", "", "", "", "", ""], "00080081": ["X", "", "", "", "", "", ""], "00081040": ["X", "", "", "", "", "", ""], "00081041": ["X", "", "", "", "", "", ""], "00080082": ["X", "", "", "", "", "", ""], "00080080": ["X", "", "", "", "", "", ""], "00189919": ["X", "", "", "", "", "C", ""], "00101050": ["X", "", "", "", "", "", ""], "30100085": ["X", "", "", "", "", "C", ""], "3010004D": ["X", "", "", "", "", "C", ""], "3010004C": ["X", "", "", "", "", "C", ""], "00401011": ["X", "", "", "", "", "", ""], "300A0741": ["X", "", "", "", "", "C", ""], "300A0742": ["X", "", "", "", "", "", "K"], "300A0783": ["X", "", "", "", "", "", "K"], "40080112": ["X", "", "", "", "", "C", ""], "40080113": ["X", "", "", "", "", "C", ""], "40080111": ["X", "", "", "", "", "", ""], "4008010C": ["X", "", "", "", "", "", ""], "40080115": ["X", "", "", "", "", "", "K"], "40080200": ["X", "", "", "", "", "", ""], "40080202": ["X", "", "", "", "", "", ""], "40080100": ["X", "", "", "", "", "C", ""], "40080101": ["X", "", "", "", "", "C", ""], "40080102": ["X", "", "", "", "", "", ""], "4008010B": ["X", "", "", "", "", "", "K"], "4008010A": ["X", "", "", "", "", "", ""], "40080108": ["X", "", "", "", "", "C", ""], "40080109": ["X", "", "", "", "", "C", ""], "00180035": ["X", "", "", "", "", "C", ""], "00180027": ["X", "", "", "", "", "C", ""], "00083010": ["X", "", "K", "", "", "", ""], "00402004": ["X", "", "", "", "", "C", ""], "00380011": ["X", "", "", "", "", "", ""], "00380014": ["X", "", "", "", "", "", ""], "00100021": ["X", "", "", "", "", "", ""], "00380061": ["X", "", "", "", "", "", ""], "00380064": ["X", "", "", "", "", "", ""], "00400513": ["X", "", "", "", "", "", ""], "00400562": ["X", "", "", "", "", "", ""], "00402005": ["X", "", "", "", "", "C", ""], "22000002": ["X", "", "", "", "", "", "K"], "00281214": ["X", "", "K", "", "", "", ""], "001021D0": ["X", "", "", "", "", "C", ""], "0016004F": ["X", "", "", "K", "", "", ""], "00160050": ["X", "", "", "K", "", "", ""], "00160051": ["X", "", "", "K", "", "", ""], "0016004E": ["X", "", "", "K", "", "", ""], "00500021": ["X", "", "", "", "", "", "K"], "04000404": ["X", "", "", "", "", "", ""], "0016002B": ["X", "", "", "", "", "", "K"], "0018100B": ["X", "", "K", "K", "", "", ""], "30100043": ["X", "", "", "K", "", "", ""], "00020003": ["X", "", "K", "", "", "", ""], "00102000": ["X", "", "", "", "", "", "K"], "00101090": ["X", "", "", "", "", "", ""], "00101080": ["X", "", "", "", "", "", ""], "04000550": ["X", "", "", "", "", "", ""], "00203403": ["X", "", "", "", "", "C", ""], "00203406": ["X", "", "", "", "", "", ""], "00203405": ["X", "", "", "", "", "C", ""], "00203401": ["X", "", "", "K", "", "", ""], "04000563": ["X", "", "", "K", "", "", ""], "30080056": ["X", "", "", "", "", "C", ""], "0018937B": ["X", "", "", "", "", "", "K"], "003A0310": ["X", "", "K", "", "", "", ""], "00081060": ["X", "", "", "", "", "", ""], "00401010": ["X", "", "", "", "", "", ""], "00081000": ["X", "", "", "C", "", "", ""], "04000552": ["X", "", "", "", "", "", ""], "04000551": ["X", "", "", "", "", "", ""], "0040A192": ["X", "", "", "", "", "C", ""], "0040A032": ["X", "", "", "", "", "C", ""], "0040A033": ["X", "", "", "", "", "C", ""], "0040A402": ["X", "", "K", "", "", "", ""], "0040A193": ["X", "", "", "", "", "C", ""], "0040A171": ["X", "", "K", "", "", "", ""], "00102180": ["X", "", "", "", "", "", "K"], "00081072": ["X", "", "", "", "", "", ""], "00081070": ["X", "", "", "", "", "", ""], "00402010": ["X", "", "", "", "", "", ""], "00402011": ["X", "", "", "", "", "", ""], "00402008": ["X", "", "", "", "", "", ""], "00402009": ["X", "", "", "", "", "", ""], "04000561": ["X", "", "", "", "", "", ""], "21000070": ["X", "", "", "C", "", "", ""], "00101000": ["X", "", "", "", "", "", ""], "00101002": ["X", "", "", "", "", "", ""], "00101001": ["X", "", "", "", "", "", ""], "60xx4000": ["X", "", "", "", "", "", ""], "60xx3000": ["X", "", "", "", "", "", ""], "00080024": ["X", "", "", "", "", "C", ""], "00080034": ["X", "", "", "", "", "C", ""], "300A0760": ["X", "", "", "", "", "C", ""], "00281199": ["X", "", "K", "", "", "", ""], "0040A07A": ["X", "", "", "", "", "", ""], "0040A082": ["X", "", "", "", "", "C", ""], "00101040": ["X", "", "", "", "", "", ""], "00101010": ["X", "", "", "", "K", "", ""], "00100030": ["X", "", "", "", "", "", ""], "00101005": ["X", "", "", "", "", "", ""], "00100032": ["X", "", "", "", "", "", ""], "00380400": ["X", "", "", "", "", "", ""], "00100050": ["X", "", "", "", "", "", ""], "00101060": ["X", "", "", "", "", "", ""], "00100010": ["Z", "", "", "", "", "", ""], "00100101": ["X", "", "", "", "", "", ""], "00100102": ["X", "", "", "", "", "", ""], "001021F0": ["X", "", "", "", "", "", ""], "00100040": ["X", "", "", "", "K", "", ""], "00102203": ["X", "", "", "", "K", "", ""], "00101020": ["X", "", "", "", "K", "", ""], "00102155": ["X", "", "", "", "", "", ""], "00102154": ["X", "", "", "", "", "", ""], "00101030": ["X", "", "", "", "K", "", ""], "00104000": ["X", "", "", "", "", "", "K"], "00100020": ["Z", "", "", "", "", "", ""], "300A0794": ["X", "", "", "", "", "", "K"], "300A0650": ["X", "", "K", "", "", "", ""], "00380500": ["X", "", "", "", "K", "", "K"], "00401004": ["X", "", "", "", "", "", ""], "300A0792": ["X", "", "", "", "", "", "K"], "300A078E": ["X", "", "", "", "", "", "K"], "00400243": ["X", "", "", "", "", "", ""], "00400254": ["X", "", "", "", "", "", "K"], "00400250": ["X", "", "", "", "", "C", ""], "00404051": ["X", "", "", "", "", "C", ""], "00400251": ["X", "", "", "", "", "C", ""], "00400253": ["X", "", "", "", "", "", ""], "00400244": ["X", "", "", "", "", "C", ""], "00404050": ["X", "", "", "", "", "C", ""], "00400245": ["X", "", "", "", "", "C", ""], "00400241": ["X", "", "", "K", "", "", ""], "00404030": ["X", "", "", "K", "", "", ""], "00400242": ["X", "", "", "K", "", "", ""], "00404028": ["X", "", "", "K", "", "", ""], "00081050": ["X", "", "", "", "", "", ""], "00081052": ["X", "", "", "", "", "", ""], "00401102": ["X", "", "", "", "", "", ""], "00401104": ["X", "", "", "", "", "", ""], "00401103": ["X", "", "", "", "", "", ""], "00401101": ["X", "", "", "", "", "", ""], "0040A123": ["X", "", "", "", "", "", ""], "00081048": ["X", "", "", "", "", "", ""], "00081049": ["X", "", "", "", "", "", ""], "00081062": ["X", "", "", "", "", "", ""], "40080114": ["X", "", "", "", "", "", ""], "00402016": ["X", "", "", "", "", "", ""], "00181004": ["X", "", "", "K", "", "", ""], "30020123": ["X", "", "", "", "", "", "K"], "30020121": ["X", "", "", "", "", "", "K"], "001021C0": ["X", "", "", "", "K", "", ""], "00400012": ["X", "", "", "", "K", "", ""], "300A000E": ["X", "", "", "", "", "", "K"], "3010007B": ["X", "", "", "", "", "", "K"], "30100081": ["X", "", "", "", "", "", "K"], "00700082": ["X", "", "", "", "", "C", ""], "00700083": ["X", "", "", "", "", "C", ""], "00701101": ["X", "", "K", "", "", "", ""], "00701102": ["X", "", "K", "", "", "", ""], "30100061": ["X", "", "", "", "", "", "K"], "ggggeeee": ["X", "C", "", "", "", "", ""], "00404052": ["X", "", "", "", "", "C", ""], "0044000B": ["X", "", "", "", "", "C", ""], "00181030": ["X", "", "", "", "", "", "K"], "00081088": ["X", "", "", "", "", "", "K"], "00200027": ["X", "", "", "", "", "", "K"], "00080019": ["X", "", "K", "", "", "", ""], "300A0619": ["X", "", "", "", "", "", "K"], "300A0623": ["X", "", "", "", "", "", "K"], "300A067D": ["X", "", "", "", "", "", "K"], "300A067C": ["X", "", "", "", "", "", "K"], "00181078": ["X", "", "", "", "", "C", ""], "00181072": ["X", "", "", "", "", "C", ""], "00181079": ["X", "", "", "", "", "C", ""], "00181073": ["X", "", "", "", "", "C", ""], "300C0113": ["X", "", "", "", "", "", "K"], "0040100A": ["X", "", "", "", "", "", "K"], "00321030": ["X", "", "", "", "", "", "K"], "3010005C": ["X", "", "", "", "", "", "K"], "04000565": ["X", "", "", "", "", "", "K"], "00402001": ["X", "", "", "", "", "", "K"], "00401002": ["X", "", "", "", "", "", "K"], "00321066": ["X", "", "", "", "", "", "K"], "00321067": ["X", "", "", "", "", "", "K"], "00741234": ["X", "", "", "C", "", "", ""], "300A073A": ["X", "", "", "", "", "C", ""], "3010000B": ["X", "", "K", "", "", "", ""], "0040A13A": ["X", "", "", "", "", "C", ""], "04000402": ["X", "", "", "", "", "", ""], "300A0083": ["X", "", "K", "", "", "", ""], "3010006F": ["X", "", "K", "", "", "", ""], "30100031": ["X", "", "K", "", "", "", ""], "30060024": ["X", "", "K", "", "", "", ""], "00404023": ["X", "", "K", "", "", "", ""], "00081140": ["X", "", "K", "", "", "", ""], "0040A172": ["X", "", "K", "", "", "", ""], "00380004": ["X", "", "", "", "", "", ""], "00101100": ["X", "", "", "", "", "", ""], "00081120": ["X", "", "K", "", "", "", ""], "00081111": ["X", "", "K", "", "", "", ""], "04000403": ["X", "", "", "", "", "", ""], "00081155": ["X", "", "K", "", "", "", ""], "00041511": ["X", "", "K", "", "", "", ""], "00081110": ["X", "", "K", "", "", "", ""], "300A0785": ["X", "", "K", "", "", "", ""], "00080092": ["X", "", "", "", "", "", ""], "00080090": ["X", "", "", "", "", "", ""], "00080094": ["X", "", "", "", "", "", ""], "00080096": ["X", "", "", "", "", "", ""], "00102152": ["X", "", "", "", "", "", ""], "300600C2": ["X", "", "K", "", "", "", ""], "00400275": ["X", "", "", "", "", "", "K"], "00321070": ["X", "", "", "", "", "", "K"], "00401400": ["X", "", "", "", "", "", "K"], "00321060": ["X", "", "", "", "", "", "K"], "00401001": ["X", "", "", "", "", "", ""], "00401005": ["X", "", "", "", "", "", ""], "00189937": ["X", "", "", "", "", "", "K"], "00001001": ["X", "", "K", "", "", "", ""], "00741236": ["X", "", "", "C", "", "", ""], "00321032": ["X", "", "", "", "", "", ""], "00321033": ["X", "", "", "", "", "", ""], "00189185": ["X", "", "", "", "", "", "K"], "00102299": ["X", "", "", "", "", "", ""], "00102297": ["X", "", "", "", "", "", ""], "40084000": ["X", "", "", "", "", "", "K"], "40080118": ["X", "", "", "", "", "", ""], "40080040": ["X", "", "", "", "", "", ""], "40080042": ["X", "", "", "", "", "", ""], "00080054": ["X", "", "", "C", "", "", ""], "300E0004": ["X", "", "", "", "", "C", ""], "300E0008": ["X", "", "", "", "", "", ""], "300E0005": ["X", "", "", "", "", "C", ""], "30060028": ["X", "", "", "", "", "", "K"], "30060038": ["X", "", "", "", "", "", "K"], "300600A6": ["X", "", "", "", "", "", ""], "30060026": ["X", "", "", "", "", "", "K"], "30060088": ["X", "", "", "", "", "", "K"], "30060085": ["X", "", "", "", "", "", "K"], "300A0615": ["X", "", "", "", "", "", ""], "300A0611": ["X", "", "", "", "", "", ""], "3010005A": ["X", "", "", "", "", "", "K"], "300A0006": ["X", "", "", "", "", "C", ""], "300A0004": ["X", "", "", "", "", "", "K"], "300A0002": ["X", "", "", "", "", "", "K"], "300A0003": ["X", "", "", "", "", "", "K"], "300A0007": ["X", "", "", "", "", "C", ""], "30100054": ["X", "", "", "", "", "", "K"], "300A062A": ["X", "", "", "", "", "", "K"], "30100056": ["X", "", "", "", "", "", "K"], "3010003B": ["X", "", "K", "", "", "", ""], "30080162": ["X", "", "", "", "", "C", ""], "30080164": ["X", "", "", "", "", "C", ""], "30080166": ["X", "", "", "", "", "C", ""], "30080168": ["X", "", "", "", "", "C", ""], "0038001A": ["X", "", "", "", "", "C", ""], "0038001B": ["X", "", "", "", "", "C", ""], "0038001C": ["X", "", "", "", "", "C", ""], "0038001D": ["X", "", "", "", "", "C", ""], "00404034": ["X", "", "", "", "", "", ""], "0038001E": ["X", "", "", "", "", "", ""], "00400006": ["X", "", "", "", "", "", ""], "0040000B": ["X", "", "", "", "", "", ""], "00400007": ["X", "", "", "", "", "", "K"], "00400004": ["X", "", "", "", "", "C", ""], "00400005": ["X", "", "", "", "", "C", ""], "00404008": ["X", "", "", "", "", "C", ""], "00400009": ["X", "", "", "", "", "", ""], "00400011": ["X", "", "", "K", "", "", ""], "00404010": ["X", "", "", "", "", "C", ""], "00400002": ["X", "", "", "", "", "C", ""], "00404005": ["X", "", "", "", "", "C", ""], "00400003": ["X", "", "", "", "", "C", ""], "00400001": ["X", "", "", "K", "", "", ""], "00404027": ["X", "", "", "K", "", "", ""], "00400010": ["X", "", "", "K", "", "", ""], "00404025": ["X", "", "", "K", "", "", ""], "00321020": ["X", "", "", "K", "", "", ""], "00321021": ["X", "", "", "K", "", "", ""], "00321000": ["X", "", "", "", "", "C", ""], "00321001": ["X", "", "", "", "", "C", ""], "00321010": ["X", "", "", "", "", "C", ""], "00321011": ["X", "", "", "", "", "C", ""], "0072005E": ["X", "", "", "C", "", "", ""], "0072005F": ["X", "", "", "", "K", "", ""], "00720061": ["X", "", "", "", "", "C", ""], "00720063": ["X", "", "", "", "", "C", ""], "00720066": ["X", "", "", "", "", "", "K"], "00720068": ["X", "", "", "", "", "", "K"], "00720065": ["X", "", "", "", "", "", ""], "0072006A": ["X", "", "", "", "", "", ""], "0072006C": ["X", "", "", "", "", "", "K"], "0072006E": ["X", "", "", "", "", "", "K"], "0072006B": ["X", "", "", "", "", "C", ""], "0072006D": ["X", "", "", "", "", "", ""], "00720071": ["X", "", "", "", "", "", ""], "00720070": ["X", "", "", "", "", "", "K"], "00080021": ["X", "", "", "", "", "C", ""], "0008103E": ["X", "", "", "", "", "", "K"], "0020000E": ["X", "", "K", "", "", "", ""], "00080031": ["X", "", "", "", "", "C", ""], "00380062": ["X", "", "", "", "", "", "K"], "00380060": ["X", "", "", "", "", "", ""], "300A01B2": ["X", "", "", "", "", "", "K"], "300A01A6": ["X", "", "", "", "", "", "K"], "004006FA": ["X", "", "", "", "", "", ""], "001021A0": ["X", "", "", "", "K", "", ""], "01000420": ["X", "", "", "", "", "C", ""], "00080018": ["X", "", "K", "", "", "", ""], "30100015": ["X", "", "K", "", "", "", ""], "0018936A": ["X", "", "", "", "", "C", ""], "00340005": ["X", "", "", "", "", "", ""], "00082112": ["X", "", "K", "", "", "", ""], "300A0216": ["X", "", "", "K", "", "", ""], "04000564": ["X", "", "", "", "", "", ""], "30080105": ["X", "", "", "K", "", "", ""], "00189369": ["X", "", "", "", "", "C", ""], "300A022C": ["X", "", "", "", "", "C", ""], "300A022E": ["X", "", "", "", "", "C", ""], "00380050": ["X", "", "", "", "K", "", ""], "0040050A": ["X", "", "", "", "", "", ""], "00400602": ["X", "", "", "", "", "", "K"], "00400551": ["X", "", "", "", "", "", ""], "00400610": ["X", "", "", "", "", "", ""], "00400600": ["X", "", "", "", "", "", "K"], "00400554": ["X", "", "K", "", "", "", ""], "00189516": ["X", "", "", "", "", "C", ""], "00080055": ["X", "", "", "C", "", "", ""], "00081010": ["X", "", "", "K", "", "", ""], "00880140": ["X", "", "K", "", "", "", ""], "30060008": ["X", "", "", "", "", "C", ""], "30060006": ["X", "", "", "", "", "", "K"], "30060002": ["X", "", "", "", "", "", "K"], "30060004": ["X", "", "", "", "", "", "K"], "30060009": ["X", "", "", "", "", "C", ""], "00321040": ["X", "", "", "", "", "C", ""], "00321041": ["X", "", "", "", "", "C", ""], "00324000": ["X", "", "", "", "", "", "K"], "00321050": ["X", "", "", "", "", "C", ""], "00321051": ["X", "", "", "", "", "C", ""], "00080020": ["X", "", "", "", "", "C", ""], "00081030": ["X", "", "", "", "", "", "K"], "00200010": ["X", "", "", "", "", "", ""], "00320012": ["X", "", "", "", "", "", ""], "0020000D": ["X", "", "K", "", "", "", ""], "00320034": ["X", "", "", "", "", "C", ""], "00320035": ["X", "", "", "", "", "C", ""], "00080030": ["X", "", "", "", "", "C", ""], "00320032": ["X", "", "", "", "", "C", ""], "00320033": ["X", "", "", "", "", "C", ""], "00440010": ["X", "", "", "", "", "C", ""], "00200200": ["X", "", "K", "", "", "", ""], "00182042": ["X", "", "K", "", "", "", ""], "0040A354": ["X", "", "", "", "", "", ""], "0040DB0D": ["X", "", "K", "", "", "", ""], "0040DB0C": ["X", "", "K", "", "", "", ""], "0040DB07": ["X", "", "", "", "", "C", ""], "0040DB06": ["X", "", "", "", "", "C", ""], "40004000": ["X", "", "", "", "", "", ""], "20300020": ["X", "", "", "", "", "", ""], "0040A122": ["X", "", "", "", "", "C", ""], "0040A112": ["X", "", "", "", "", "C", ""], "00181201": ["X", "", "", "K", "", "C", ""], "0018700E": ["X", "", "", "K", "", "C", ""], "00181014": ["X", "", "", "", "", "C", ""], "00080201": ["X", "", "", "", "", "C", ""], "00880910": ["X", "", "", "", "", "", ""], "00880912": ["X", "", "", "", "", "", ""], "00880906": ["X", "", "", "", "", "", ""], "00880904": ["X", "", "", "", "", "", ""], "00620021": ["X", "", "K", "", "", "", ""], "00081195": ["X", "", "K", "", "", "", ""], "00185011": ["X", "", "", "K", "", "", ""], "30080024": ["X", "", "", "", "", "C", ""], "30080025": ["X", "", "", "", "", "C", ""], "30080250": ["X", "", "", "", "", "C", ""], "300A00B2": ["X", "", "", "K", "", "", ""], "300A0608": ["X", "", "", "", "", "", "K"], "300A0609": ["X", "", "K", "", "", "", ""], "300A0700": ["X", "", "K", "", "", "", ""], "30100077": ["X", "", "", "", "", "", "K"], "300A000B": ["X", "", "", "", "", "", "K"], "3010007A": ["X", "", "", "", "", "", "K"], "30080251": ["X", "", "", "", "", "C", ""], "300A0736": ["X", "", "", "", "", "C", ""], "300A0734": ["X", "", "", "", "", "", "K"], "0018100A": ["X", "", "", "K", "", "", ""], "0040A124": ["X", "", "", "", "", "", ""], "00181009": ["X", "", "", "K", "", "", ""], "30100033": ["X", "", "", "", "", "", "K"], "30100034": ["X", "", "", "", "", "", "K"], "0040A352": ["X", "", "", "", "", "", ""], "0040A358": ["X", "", "", "", "", "", ""], "0040A030": ["X", "", "", "", "", "C", ""], "0040A088": ["X", "", "", "", "", "", ""], "0040A075": ["X", "", "", "", "", "", ""], "0040A073": ["X", "", "", "", "", "", ""], "0040A027": ["X", "", "", "", "", "", ""], "00384000": ["X", "", "", "", "", "", "K"], "003A0329": ["X", "", "", "", "", "", "K"], "00189371": ["X", "", "", "K", "", "", ""], "00189373": ["X", "", "", "K", "", "", ""], "00189367": ["X", "", "", "K", "", "", ""]};