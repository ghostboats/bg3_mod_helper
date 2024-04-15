# BG3 Mod Helper Extension

This Visual Studio Code extension aids in modding Baldur's Gate 3 by speeding up various tasks. It offers a wide range of functionalities aimed at improving mod development efficiency.

## General Features

- **Generate UUIDs/Handles** via right-click menu:
  - Auto-create a handle in your localization file upon spawning a handle.
  - Auto-highlight for quick copy on UUID/Handle generation.
- **Hover over UUIDs/Handles** to find related UUIDs/Handles in your mod's root folder:
  - Click the hover to move directly to that file/line.
- **Right-click in the editor** to access tools like the stats/lsx validator and search tool via the export tools menu option (Internet connection required).
- **Right-click in the file tree** to create a BG3 file from the menu (Ctrl+Shift+Q).
- **Convert .DDS or .png files** to the opposite format by right-clicking on them.
- **Resize .DDS/.png files** to a custom size or standard sizes for icons.
- **Enhanced function definitions and parameters** for BG3, including stats functions and progressions. Future updates may include SE functions.

## Data Provider Features

- **Pack Mod**: Automatically packs your mod and sends the new .pak to the Mods folder.
  - Auto-creates meta.lsx if it's missing and prompts you for details.
  - Automatically launches the game if selected in settings.
  - Converts all merged.lsx to merged.lsf for packing.
  - Converts all .xml localization folders in your Localization (supports multiple languages).
- **Launch Game**: Launch the most recent save on game start.
- **Xml To Loca**: Converts XML files to LOCA files, with options for mass or single file conversion.
- **Generate Folder Structure**: Helps in creating a basic mod folder structure based on user selection.

## Installation & Download Options

- [Nexus Mods](https://www.nexusmods.com/baldursgate3/mods/6574)
- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=ghostboats.bg3-mod-helper)
- Directly from inside VS Code (search in extensions 'bg3_mod_helper').
- Github: Coming soon!
- VSIX (less frequently updated): Install via VS Code.

Dependencies include Python, PythonNet, Image Magick, lslib, divine.exe. The extension will guide you through the download and installation if these are not found.

## Contribution & Feedback

If you have any feature requests or encounter bugs, please feel free to reach out. Contributions and suggestions are highly appreciated to enhance this tool.

A special thanks to the BG3 community whose documentation provided significant assistance in the development of this extension.
