import os
from pathlib import Path
import argparse
#pip install --upgrade pythonnet

print('--xml_to_loca.py--')
script_dir = Path(os.path.dirname(os.path.abspath(__file__)))
print('Script location(will change dir to it): '+str(script_dir))
os.chdir(script_dir)

parser = argparse.ArgumentParser()
parser.add_argument("-d", "--divine", type=Path)
parser.add_argument("-o", "--output", type=Path)
parser.add_argument("-f", "--file", type=Path)

args = parser.parse_args()

target_file:Path = args.file
output_file:Path = args.output
print('Target_file: '+str(target_file)+'\nOutput_File: '+str(output_file))

if target_file.exists():
    lslib_dll:Path = args.divine.is_dir() and args.divine.joinpath("LSLib.dll") or args.divine.parent.joinpath("LSLib.dll")
    print('LSLib.dll at: '+str(lslib_dll))
    if lslib_dll.exists():
        import clr
        from System.Reflection import Assembly # type: ignore 
        Assembly.LoadFrom(str(lslib_dll.absolute()))
        clr.AddReference("LSLib") # type: ignore 
        clr.AddReference("System") # type: ignore 

        from LSLib.LS import LocaUtils, LocaFormat # type: ignore 
        from System.IO import File, FileMode # type: ignore 
        
        in_format = LocaFormat.Xml
        out_format = LocaFormat.Loca
        
        ext = target_file.suffix.lower()
        
        if ext == ".xml":
            in_format = LocaFormat.Xml
            out_format = LocaFormat.Loca
        elif ext == ".loca":
            in_format = LocaFormat.Loca
            out_format = LocaFormat.Xml
        
        if output_file is None:
            if out_format == LocaFormat.Xml:
                output_file = target_file.with_suffix(".xml")
            elif out_format == LocaFormat.Loca:
                output_file = target_file.with_suffix(".loca")

        fs = File.Open(str(target_file.absolute()), FileMode.Open)
        resource = LocaUtils.Load(fs, in_format)
        LocaUtils.Save(resource, str(output_file.absolute()), out_format)
        fs.Dispose()
        print(f"Converted {target_file} to {output_file}")
    else:
        raise FileNotFoundError("Failed to find LSLib.dll in the provided divine path.")
else:
    raise FileNotFoundError("A valid path to a xml file is required.")
print('__xml_to_loca.py__')