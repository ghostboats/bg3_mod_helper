# bg3-mod-helper README

This is the README for the "bg3-mod-helper" extension, designed to assist with mod development for Baldur's Gate 3. This extension simplifies the process of generating UUIDs and handles, as well as providing easy navigation to instances of these identifiers across your project.

Install the extension by opening Visual Studio Code, clicking the View button on the top ribbon, clicking the ... button, and choosing Install from VSIX....

## Features

bg3-mod-helper includes several features to streamline the modding process:

- **UUID and Handle Generation**: Quickly generate UUIDs and handles via right clicking, directly within your workspace.
- **Instance Finder**: Hover over a UUID or handle to see a tooltip showing where it's used in your workspace.
- **Quick Navigation**: Right-click on a UUID or handle and use the "Go to UUID/Handle" option to open a list of files where it's used, allowing you to jump directly to any occurrence.
- **Instant .loca.xml Updating**: If a new handle is generated and you have a .loca.xml file, it will generate a blank entry for you with that new handle.
- **In Editor Export Tools**: If you have an internet connection, rigth click in the editor and hover over the export tools to access the the stats/lsx validator tools and search tool in visual studio. (If you click it while having text highlighted it will autocopy the text so you can easily paste as well)
- **BG3 File Creation**: Right click and press Create BG3 File (or control shift q) to open a filterable dropdown of baulders gate 3 lsx files to use as a template for mods.
- **Dynamic Copying**: By specifying "< !--press control shift a to quick spawn a line below" and "end custom attribute lines-->" as well as "< !--press control shift 2 to quick spawn a line below" and "end ctrl shift 2 clipboard-->" (remove the space before the !), you can use their respective commands to quickly get a dropdown of items between the rows, which helps quick add lines. Some templates come with it, looking to the community for help fillign them all out with all their respective attribute lines. Control shift 2 is just there for fun, maybe you can find use for it.
- **Side Bar Options**: On the left side you will see a new icon. If you click it you can see a menu that lets you pack your mod, convert xml to loca files, and launch the game, right from inside visual studio code. You will need the export tools (specfically the divine.exe and lslib.dll) and make sure they are in their correct default spot. Your bg3 file needs to be in the starnard bin location. Ensure your mod destination path is provided to be able to pack and auto send to mods, a mod needs to be acviated in mod manager at least once before you can launch from visual studio straight
> Tip: Ignore this, gunna add screenshots on full release.

## Requirements

bg3-mod-helper does not have any specific requirements outside of Visual Studio Code.

## Extension Settings

This extension contributes the following settings:

- `bg3ModHelper.enable`: Enable/disable this extension.
- `bg3ModHelper.customHandleFormat`: Set your custom format for handle generation.

## Known Issues

- May not work in large workspaces due to too many files to search.

## Release Notes

Beta Release. Need to see if this something people want, bugs, and future updates.

### 0.9.930

- Beta release of bg3-mod-helper.
- Features include UUID and handle generation, instance finder, and quick navigation.

### [Future releases]

- Unsure, contact me on discord if you have a feature you would like implemented.

---

## Working with bg3-mod-helper

- Install the extension through Visual Studio Code (View -> Extensions -> `...` -> Install from VSIX).
- Access commands via the command palette or context menu in the editor.
- Right click to spawn new UUID's and Handles.
- Hover over or right click to find the location of linked UUID's/handles.
- Use the stats/lsx validator tools and search engine tool in a visual studio tab

## For more information

- [My bg3 modders wiki](https://github.com/ghostboats/bg3_modders_guide/wiki)


**Enjoy your modding journey with bg3-mod-helper!**
