<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BG3 Mod Helper Extension</title>
</head>
<body>
    <h1>BG3 Mod Helper Extension</h1>
    <p>This Visual Studio Code extension aids in modding Baldur's Gate 3 by speeding up various tasks. It offers a wide range of functionalities aimed at improving mod development efficiency.</p>

    <h2>General Features:</h2>
    <ul>
        <li>Generate UUIDs/Handles via right-click menu.
            <ul>
                <li>Auto-create a handle in your localization file upon spawning a handle.</li>
                <li>Auto-highlight for quick copy on UUID/Handle generation.</li>
            </ul>
        </li>
        <li>Hover over UUIDs/Handles to find related UUIDs/Handles in your mod's root folder.
            <ul>
                <li>Click the hover to move directly to that file/line.</li>
            </ul>
        </li>
        <li>Right-click in the editor to access tools like the stats/lsx validator and search tool via the export tools menu option (Internet connection required).</li>
        <li>Right-click in the file tree to create a BG3 file from the menu (Ctrl+Shift+Q).</li>
        <li>Convert .DDS or .png files to the opposite format by right-clicking on them.</li>
        <li>Resize .DDS/.png files to a custom size or standard sizes for icons.</li>
        <li>Enhanced function definitions and parameters for BG3, including stats functions and progressions. Future updates may include SE functions.</li>
    </ul>

    <h2>Data Provider Features:</h2>
    <ul>
        <li>Pack Mod: Automatically packs your mod and sends the new .pak to the Mods folder.
            <ul>
                <li>Auto-creates meta.lsx if it's missing and prompts you for details.</li>
                <li>Automatically launches the game if selected in settings.</li>
                <li>Converts all merged.lsx to merged.lsf for packing.</li>
                <li>Converts all .xml localization folders in your Localization (supports multiple languages).</li>
            </ul>
        </li>
        <li>Launch Game: Launch the most recent save on game start.</li>
        <li>Xml To Loca: Converts XML files to LOCA files, with options for mass or single file conversion.</li>
        <li>Generate Folder Structure: Helps in creating a basic mod folder structure based on user selection.</li>
    </ul>

    <h2>Installation & Download Options:</h2>
    <ul>
        <li><a href="https://www.nexusmods.com/baldursgate3/mods/6574">Nexus Mods</a></li>
        <li><a href="https://marketplace.visualstudio.com/items?itemName=ghostboats.bg3-mod-helper">VS Code Marketplace</a></li>
        <li>Directly from inside VS Code (search in extensions 'bg3_mod_helper').</li>
        <li>Github: Coming soon!</li>
        <li>VSIX (less frequently updated): Install via VS Code.</li>
    </ul>

    <p>Dependencies include Python, PythonNet, Image Magick, lslib, divine.exe. The extension will guide you through the download and installation if these are not found.</p>

    <h2>Contribution & Feedback:</h2>
    <p>If you have any feature requests or encounter bugs, please feel free to reach out. Contributions and suggestions are highly appreciated to enhance this tool.</p>

    <p>A special thanks to the BG3 community, especially Norbyte, LaughingLeader, and Kaz, whose documentation and efforts provided significant assistance in the development of this extension.</p>
</body>
</html>
