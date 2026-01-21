# LineBlox

> **Important:** LineBlox v1 will no longer be officially supported once v2 is released. 
> You can still access v1 via the `legacy/v1` or `legacy/v1-beta` branches. 
> v2 will replace v1 on the `main` and `beta` branches.
> The duration until LineBlox v2 is currently unknown.

**LineBlox** is a **node-based visual scripting tool** designed to run directly in the browser using **HTML** and **JavaScript**.


## Demo

Try the live demo here: [LineBlox Demo](https://pilottim136.github.io/LineBlox)


## Features

- Drag-and-drop node interface
- Create logic visually without writing code
- Easily extensible with custom nodes


## Installation

1. Download this repository (Code -> Download ZIP)
2. Exctract the zip
3. Open index.html or editor.html in your browser.
4. Start creating!


## Quick Start / Script Import

You can also use LineBlox directly in your project by including the script from GitHub Pages:

```html
<script src="https://pilottim136.github.io/LineBlox/versions/lineblox-1.0.0.js"></script>
```

This script contains the full workspace and toolbox environment for you to use it immediately.

> **NOTICE**: You can replace the "1.0.0" version to the version you want to use. If you want to update your project to a more recent release, please make sure that you create a backup before updating, as updates may be breaking for older infrastructure.

### LineBlox setup

To actually use the Javascript-Imported runtime, you'll need to create a JS file containing the following content:

```javascript
//This is an example how to create categories for the toolbox.
const toolbox = [
   {
      category: "Main", //category name
      color: "green",   //category color
      blocks: [
         "__start__"    //block-ID
      ]
   }
]

//This is how you can set up the workspace itself.
const config = new LineBloxConfig();               //initialize config
config.offsets.left = 0;                           //set offsets here (you do not have to set them, the defaults are 0)
config.offsets.right = 0;
config.offsets.top = 40;

config.toolbox.tbNodes = toolbox;                  //set the categories for the workspace
config.toolbox.toolboxW = 300;                     //width of the toolbox - less than 100 and there is no toolbox.

const LBInst = new LineBlox(null, config);         //PARAMETERS:
                                                   //"null": What node the code will start one (node-ID, null = "__start__").
                                                   //"config": Configuration for the LineBlox instance

(async () => {
    await LBInst.EnablePluginSupport("js/nodes/plugins/", "pluginDefs.jsonc");
});
                           //PARAMETERS:
                           //"js/nodes/plugins/" -> path to the plugins
                           //"pluginDefs.jsonc" -> the defenition for the plugins (view "js/nodes/plugins/pluginDefs.jsonc" for more information
                           //about how and why to store plugins in a JSON. You will also get a small set of instructions what to do)
```

See [pluginSystem.md](pluginSystem.md) for ways to integrate the plugin system into your project.

> **NOTE**: This example was from code in the "otherJS/script.js" file. This example does include comments, which the file didn't have.

### Other LineBlox components:

For this example we're going to use the variable *"LBInst"*.
```javascript
//This returns the current workspace JSON.
//For example, when there's a start node connected to a Print, it's going to return "start -> print", but a little more complex.
const wsJson = LBInst.GetWorkspace();

//This sets the workspace to the given JSON (or string)
//For example, you give it "start -> print", it will display the nodes respective to where it was saved.
LBInst.SetWorkspace(wsJson);

//This generates the node-based code.
LBInst.GenerateCode();

//--------GENERATED--------\\
console.log(); //This would be the output of the nodes: "start -> print".
```


> **NOTE**: The variable-name *"LBInst"* is changeable. Making a variable for the instance is recommended, which is where you can generate your code from.

If you want to use the default-blocks, you have to also import this via HTML:
```html
<script src="https://pilottim136.github.io/LineBlox/js/nodes/main.js"></script>
```
This contains every node available in the DEMO.


## Contributing

Contributions are always welcome!

See [contributing.md](contributing.md) for ways to get started.


## License

[MIT](https://choosealicense.com/licenses/mit/)

![License](https://img.shields.io/badge/license-MIT-green)



