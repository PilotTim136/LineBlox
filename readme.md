# LineBlox

**LineBlox** is a **node-based visual scripting tool** designed to run directly in the browser using **HTML** and **JavaScript**.


## Demo

Try the live demo here: [LineBlox Demo](https://pilottim136.github.io/LineBlox)


## Features

- Drag-and-drop node interface
- Create logic visually without writing code
- Easily extensible with custom nodes (Currently no dynamic way to import nodes into workspace)

## Installation

1. Clone this repository:

```bash
   git clone https://github.com/PilotTim136/LineBlox.git
```

2. Open index.html or editor.html in your browser.
3. Start creating!


## Quick Start / Script Import

You can also use LineBlox directly in your project by including the script from GitHub Pages:

```html
<script src="https://pilottim136.github.io/LineBlox/versions/lineblox-1.0.0.js"></script>
```

This script contains the full workspace and toolbox environment for you to use it immediately.

> **NOTICE**: You can replace the "1.0.0" version to the version you want to use. If you want to update your project to a more recent release, please make sure that you create a backup before updating, as updates may be breaking for older infrastructure.

### LineBlox setup

To actually use the Javascript-Imported runtime, you'll need to create a file, that contains following content:

```javascript
//This is an example how to create categories for the toolbox.
const toolbox = {
   category: "Main", //category name
   color: "green",   //category color
   blocks: [
      "__start__"    //block-ID
   ]
}

//This is how you can set up the workspace itself.
const LBInst = new LineBlox(null, 40, 0, 0, toolbox, 300);
//PARAMETERS:
//"null": What node the code will start one (node-ID, null = "__start__").
//"40": Y-offset for the workspace & toolbox.
//"0": X-offset for the workspace & toolbox.
//"0": Max-width (basically: in CSS "right: 0px")
//"tb": toolbox categories
//"300": the amount of pixels to give the toolbox (left side)
```

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

See [CONTRIBUTING.md](CONTRIBUTING.md) for ways to get started.


## License

[MIT](https://choosealicense.com/licenses/mit/)

![License](https://img.shields.io/badge/license-MIT-green)


