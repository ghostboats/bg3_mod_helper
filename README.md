# BG3 Mod Helper Extension

This Visual Studio Code extension aids in modding Baldur's Gate 3 by speeding up various tasks. It offers a wide range of functionalities aimed at improving mod development efficiency.

## DEV BRANCH IS NOT FUNCTIONAL AND IS UNDER HEAVY DEVELOPMENT. PLEASE BUILD FROM THE PROD BRANCH.

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

To install the BG3 Mod Helper, follow these instructions:

1. **Open Visual Studio Code**:
   - Launch the Visual Studio Code application on your computer.

2. **Access Extensions**:
   - Click on `View` in the top menu.
   - Select `Extensions` from the dropdown menu.

3. **Install from VSIX**:
   - In the Extensions view, click on the `...` button at the top-right corner.
   - Choose `Install from VSIX` from the dropdown menu.

4. **Select the VSIX File**:
   - Navigate to the folder where you downloaded the `.vsix` file.
   - Select the file and click `Open`.

### Additional Download Options:
- [Nexus Mods](https://www.nexusmods.com/baldursgate3/mods/6574)
- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=ghostboats.bg3-mod-helper)
- Directly from inside VS Code (search in extensions 'bg3_mod_helper').

## Contribution & Feedback

If you have any feature requests or encounter bugs, please feel free to reach out. Contributions and suggestions are highly appreciated to enhance this tool.

A special thanks to the BG3 community, whose documentation provided significant assistance in the development of this extension.

DMing on discord is best way to directly contact me.
