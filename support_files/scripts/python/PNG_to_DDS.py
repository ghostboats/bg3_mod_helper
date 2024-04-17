from pathlib import Path
from typing import List
import argparse
import wand.image
import re

parser = argparse.ArgumentParser(description='Batch convert image files')
parser.add_argument("-f", "--files", type=str, help='Selection of files to include, separated with ;')
parser.add_argument("-d", "--directory", type=str, help='The directory to process, if any.')
parser.add_argument("--outputdirectory", type=Path, help='If set, converted files will be placed here.')
parser.add_argument("-e", "--ext", nargs='+', help='If in directory mode, only include these file extensions.')
parser.add_argument("-r", "--recursive", default=False, type=bool, help='If in directory mode, whether to recursively search directories.')
parser.add_argument("-o", "--outputformat", default=".png", type=str, help='The output format.')
parser.add_argument("-q", "--quality", default=100, type=int, help='Output quality.')
parser.add_argument("--alpha", default=None, type=str, help='Force alpha or not (true or false works). See: https://docs.wand-py.org/en/latest/wand/image.html#wand.image.ALPHA_CHANNEL_TYPES for other values.')
parser.add_argument("--ddscompression", default=None, type=str, help='If outputformat is ".dds", this is the compression to use. [dxt1, dxt3, dxt5]')
parser.add_argument("--append", default="", type=str, help='Append text to the output filename.')
parser.add_argument("--size", type=str, metavar='width;height', help='Optional size to use in the output (ex: --size 64;64)')
parser.add_argument("--srgb", action='store_true', help='Whether to enable SRGB.')

args = parser.parse_args()

alpha_pattern = re.compile(r"^.*_((\w\wa)|(nm))$", re.IGNORECASE | re.MULTILINE)

if args.alpha:
    match str.lower(args.alpha):
        case "true" | "yes" | "1":
            args.alpha = True
        case "false" | "no" | "none" | "null" | "undefined" | "0":
            args.alpha = False

def name_has_alpha(name:str):
    if alpha_pattern.search(name):
        return True
    return False

def convert_image(f:Path):
    file_path = str(f.absolute())
    output_path = f.with_name(f"{f.stem}{args.append or ''}").with_suffix(args.outputformat)
    if args.outputdirectory:
        if not args.outputdirectory.is_dir():
            args.outputdirectory = args.outputdirectory.parent
        args.outputdirectory.mkdir(exist_ok = True, parents = True)
        output_path = args.outputdirectory.joinpath(output_path.name)
    output_path = str(output_path.absolute())

    with wand.image.Image(filename=file_path) as img:
        img.format = str.replace(args.outputformat, ".", "")
        img.compression_quality = args.quality
        if args.size is not None:
            sizes = str.split(args.size, ";")
            w = int(sizes[0])
            h = int(sizes[1]) or w
            img.resize(w, h)
        if args.alpha is not None:
            img.alpha_channel = args.alpha
        if args.srgb:
            img.transform_colorspace("srgb")
        
        match args.outputformat:
            case ".jpg" | ".jpeg":
                img.compression = 'jpeg'
            case ".dds":
                if args.ddscompression == None and name_has_alpha(f.stem):
                    img.compression = "dxt5"
                    img.alpha_channel = True
                else:
                    img.compression = args.ddscompression or "dxt1"
                    if args.alpha is None:
                        img.alpha_channel = args.ddscompression == "dxt5" # Probably should have alpha
            case _:
                pass

        img.save(filename=output_path)
    
# def convert_image_pillow(f:Path):
#     from PIL import Image
#     output_format = str.replace(args.outputformat, ".", "").upper()
#     im = Image.open(f)
#     if args.outputformat == ".jpg" and im.mode in ("RGBA", "P"): im = im.convert("RGB")
#     if args.size is not None:
#         im.save(f.with_suffix(args.outputformat), quality=args.quality, format=output_format, sizes=[(args.size,args.size)])
#     else:
#         im.save(f.with_suffix(args.outputformat), quality=args.quality, format=output_format)

if args.files is not None:
    files:List[Path] = [Path(s) for s in args.files.split(";")]
    for f in files:
        convert_image(f)
elif args.directory is not None:
    files:List[Path] = None
    dir_path = Path(args.directory)
    if args.ext is not None:
        anyFile = "*" in args.ext
        if args.recursive:
            files = [p for p in dir_path.rglob('*') if (anyFile or p.suffix in args.ext)]
        else:
            files = [p for p in dir_path.glob('*') if (anyFile or p.suffix in args.ext)]
    else:
        if args.recursive:
            files = [p for p in dir_path.rglob('*') if p.is_file()]
        else:
            files = [p for p in dir_path.glob('*') if p.is_file()]
    
    if files is not None and len(files) > 0:
        for f in files:
            convert_image(f)
        print("[convert_images] All done.")
    else:
        print("Failed to find any image files in directory. Skipping.")
else:
    print("Failed to find any files. Skipping.")
    parser.print_help()