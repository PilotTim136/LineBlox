//this is an example plugin for LineBlox that adds 1 node: require

const njsPlugin = new LBPlugin("lb_njs", "nodeJS");

//for intellisense autocompletion
/**
 * @param {LBPlugin} inst
 * @param {LineBlox} lb
 */
njsPlugin.initFunc = (inst, lb) => {
    console.log("Initializing nodeJS plugin...");

    const u_col = "rgba(0, 124, 6, 1)";       //universal color for this plugin
    const u_cat = "NodeJS";                     //universal category name for this plugin

    inst.AddCategory(u_cat, u_col);             //category data for the toolbox

    //define the nodes one by one.
    //give plugin name as string.
    inst.AddNode({
        name: "Require",
        internalID: "njs_req",
        color: u_col,
        width: 120,
        inputs: [
            {
                name: "",
                type: "Connect",
                code: (data) => {
                    return `const ${LineBlox._validateVarStr(data.input["module"])} = require(${LineBlox._wrapStr(data.input["module"], false)});\n`;
                }
            },
            {
                name: "module",
                type: "String",
                integrated: true,
                inputWidth: 80,
                ignoreText: true
            }
        ],
        outputs: [
            {
                name: "",
                type: "Connect"
            }
        ]
    }, u_cat);

    console.log("Initialized nodeJS plugin");
};

njsPlugin.AddToWorkspace(); //adds it to the workspace

//todo: use `BNodes.inst.InitializePlugins()` in devTools to try the plugin (please do not use that function in your plugin)
