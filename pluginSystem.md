# The 1.2.0 Plugin System

The Plugin system is a powerful tool, which allows for simple integration for custom-made nodes for the runtime and hot-loading.


## Initialization

When initializing the new Plugin system, you have to do it like this:
```javascript
await LBInst.EnablePluginSupport("js/nodes/plugins/", "pluginDefs.jsonc");
```
This is, so LineBlox knows that plugins are found in the `js/nodes/plugins/` directory.<br>
The other parameter *"pluginDefs.jsonc"* should be located in: `js/nodes/plugins/pluginDefs.jsonc`.<br>
This is important, because pluginDefs contains the file-path to the plugin with a specific UUID. For example, the **"nodeJS"** plugin has the UUID of **"lb_njs"**. Then the file would contain information like this:
```json
[
    {
        "uuid": "lb_njs",
        "file": "nodeJS"
    }
]
```

**UUID** is the UUID of the plugin (`lb_njs`)<br>
**FILE** is where the file is located (`js/nodes/plugins/nodeJS`)

> **NOTE**: LineBlox automatically adds `.js` to plugins when beeing read.

> **NOTE**: The example definition file is located in: `js/nodes/plugins/pluginDefs.jsonc`.<br>
For more information about (user)uploading & dynamically using the plugin definitions, please visit `pluginDefs.jsonc` and read the comments.


## Setup

You can easily set up the plugin system to be dynamic, but you will need a backend in `Python`, `Javascript` or any other language.

In the previous step, all the definitions were in `pluginDefs.jsonc`.

> **NOTE**: using jsonc is not recommended. Please use normal JSON for the plugin definitions.

To allow a dynamic definition-JSON, please change this:
```javascript
//from this
await LBInst.EnablePluginSupport("js/nodes/plugins/", "pluginDefs.jsonc");
//to this
await LBInst.EnablePluginSupport("js/nodes/plugins/", "<definition-endpoint>");
```

> **NOTE**: *\<definition-endpoint>* can be any endpoint you want. *definitions* is recommended.

The plugin system will then try and reach your definition-endpoint, which will contain all the plugins.
