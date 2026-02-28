////////////////////////////////////
///                               //
///     LINEBLOX NODE EXAMPLE     //
///                               //
////////////////////////////////////

const creator = LBCreator;
const toolbox = LBToolbox;

toolbox.RegisterCategory("Example", "#bd8100");
toolbox.RegisterCategory("Example2");       //this is how to add a category
toolbox.RemoveCategory("Example2");         //this is how to remove a category

//#region ADVANCED

const node1 = new LB_NodeData();
const node1_out_code = new LB_NodeIO("", "Connection", "code", false/*, true*/);
node1_out_code.code = data => {
    const codeIn = data.input?.["code"] ?? "";
    return codeIn + "hello (__node1__)\n";
};

node1.uniqueId = "__node1__";
node1.publicName = "ExampleNode1";
node1.color = Color.fromHexString("#bd8100");
node1.size.x = 100;
node1.inputs = [new LB_NodeIO("", "Connection", "code", false/*, true*/), new LB_NodeIO("aaaa", "String", "code2", true)];
node1.outputs = [node1_out_code];
node1.category = "Example";
node1.alwaysGenerate = 0;

creator.RegisterNodeAdvanced(node1);

//#endregion

//#region SIMPLE

creator.RegisterNode({
    id: "__node2__",
    publicName: "ExampleNode2",
    color: Color.fromHexString("#bd8100"),
    width: 100,                     //width of the node (height will be calculated during runtime)
    category: "Example",            //the category the node will be found in
    alwaysGenerate: 0,              //wether this code should ALWAYS be generated (even if not connected via code) or not.
                                    //(0 is disabled. higher number is higher priority)
    inputs: [
        {
            id: "code",
            name: "",
            type: "Connection",     //the type of connection, multiple are built in: "String", "Number", "Boolean"/"Bool", "Connection"
            allowMultiple: false
        },
        {
            id: "code2",
            name: "a",
            type: "String"
        },
        {
            id: "code3",
            name: "b",
            type: "String"
        }
    ],
    outputs: [
        {
            id: "code",
            name: "",
            type: "Connection",
            code: data => {
                const code2 = data.input["code2"] ?? "";
                const code3 = data.input["code3"] ?? "";
                return (data.input["code"] ?? "") + `[${code2}], [${code3}]\n`;
            }
        },
        {
            id: "code2",
            name: "aaaa",
            type: "String",
            allowMultiple: true,    //wether or not multiple connections can be made or not
            code: data => {
                //data only has input-values here!
                const code2 = data.input["code2"] ?? "";
                const code3 = data.input["code3"] ?? "";

                return `${data.input["code2"] + data.input["code3"]}`;
            }
        }
    ]
});

//#endregion

//#region for testing

const start = new LB_NodeData();
const start_out_code = new LB_NodeIO("", "Connection", "code");
start_out_code.code = data => {
    return data.output["code"];
};

start.uniqueId = "LB_Start";
start.publicName = "Start";
start.color = Color.fromHexString("#10bd00");
start.size.x = 75;
start.inputs = [];
start.outputs = [start_out_code];
start.category = "Example";
start.alwaysGenerate = 100;

creator.RegisterNodeAdvanced(start);

//#endregion


creator.RegisterNode({
    id: "__node3__",
    publicName: "ExampleNode3",
    color: Color.fromHexString("#00bdad"),
    width: 100,
    category: "Example",
    alwaysGenerate: 0,
    inputs: [
        {
            id: "strIn",
            name: "",
            type: "String",
            hide: true,
            integrated: true,
            boxWidth: 50
        }
    ],
    outputs: [
        {
            id: "strOut",
            name: "",
            type: "String",
            allowMultiple: true,
            code: data => {
                return `ay`;
            }
        }
    ]
});
