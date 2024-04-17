import os
from pathlib import Path
import argparse

print('--convert_lsf.py--')
script_dir = Path(os.path.dirname(os.path.abspath(__file__)))
print('Script location(will change dir to it): '+str(script_dir))
os.chdir(script_dir)

parser = argparse.ArgumentParser()
parser.add_argument("-d", "--divine", type=Path, help="The path to divine.exe.")
parser.add_argument("-o", "--output", type=Path, help="The output file path.")
parser.add_argument("-f", "--file", type=Path, required=True, help="The file to convert.")
parser.add_argument("-b", "--batch", action='store_true', help="Batch convert an input directory instead.")
parser.add_argument("--ext", type=str, default=".lsf", help="If in batch mode, make this the input file type (defaults to .lsf).")
parser.add_argument("--outputext", type=str, default=".lsx", help="If in batch mode, make this the output file tyoe  (defaults to .lsx).")

args = parser.parse_args()

input_file:Path = args.file
output_file:Path = args.output
lslib_dll:Path = args.divine.is_dir() and args.divine.joinpath("LSLib.dll") or args.divine.parent.joinpath("LSLib.dll")
batch:bool = args.batch == True
in_type:str = args.ext
out_type:str = args.outputext
import clr
if lslib_dll.exists():
    from System.Reflection import Assembly # type: ignore 
    Assembly.LoadFrom(str(lslib_dll.absolute()))
    clr.AddReference("LSLib") # type: ignore 

    from LSLib.LS import ResourceUtils, ResourceConversionParameters, ResourceLoadParameters # type: ignore 
    from LSLib.LS.Enums import Game, ResourceFormat # type: ignore
    
    load_params = ResourceLoadParameters.FromGameVersion(Game.BaldursGate3)
    conversion_params = ResourceConversionParameters.FromGameVersion(Game.BaldursGate3)
    
    def process_file(input:Path, output:Path = None):
        ext = input.suffix.lower()
        
        if output is None:
            if ext != ".lsx":
                output = input.with_suffix(".lsx")
            else:
                output = input.with_suffix(".lsf")

        input_str = str(input.absolute())
        output_str = str(output.absolute())
        
        out_format = ResourceUtils.ExtensionToResourceFormat(output_str)
        resource = ResourceUtils.LoadResource(input_str, load_params)
        ResourceUtils.SaveResource(resource, output_str, out_format, conversion_params)

    if input_file.is_dir():
        
        input_str = str(input_file.absolute())
        if output_file is None:
            output_file = input_file
        output_str = str(output_file.absolute())
        
        input_format = ResourceUtils.ExtensionToResourceFormat(in_type)
        out_format = ResourceUtils.ExtensionToResourceFormat(out_type)
        

        utils = ResourceUtils()

        utils.ConvertResources(input_str, output_str, input_format, out_format, load_params, conversion_params);
    elif input_file.exists():
        process_file(input_file, output_file)
else:
    raise FileNotFoundError("Failed to find LSLib.dll", lslib_dll)
print('__convert_lsf.py__')