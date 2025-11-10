const _displayVals = [
    { dsp: "Any", val: "Any" },
    { dsp: "String", val: "String" },
    { dsp: "Number", val: "Number" },
    { dsp: "Boolean", val: "Boolean" },
    { dsp: "Variable", val: "Variable" },
    { dsp: "Connection", val: "Connect" }
];

BNodes.blocks.push({
    name: "Node Data",
    internalID: "node_main",
    color: "rgba(255, 0, 0, 1)",
    width: 150,
    inputs: [
        {
            name: "",
            type: "Connect",
            code: (data) => {
                let name = data.input["nodeName"] ?? "<unnamed>";
                let iName = data.input["nodeInternalName"] ?? "node_internal_unnamed";
                const _col = data.input["nodeColor"];
                const col = _col == "" ? "\"rgba(255, 145, 0, 1)\"" : _col;
                const _w = data.input["nodeWidth"];
                const w = isNaN(parseInt(_w)) ? 100 : parseInt(_w);
                const _ag = data.input["nodeAlwaysGen"];
                const ag = isNaN(parseInt(_ag)) ? 0 : parseInt(_ag);
                const inputs = data.input["nodeInputs"] ?? "";
                const outputs = data.input["nodeOutputs"] ?? "";
                
                name = LineBlox._escapeForStr(name);
                iName = LineBlox._escapeForStr(iName);

                return `BNodes.blocks.push({
    name: ${name},
    internalID: ${iName},
    color: ${col},
    width: ${w},
    alwaysGenerate: ${ag},
    inputs: [\n${inputs}],
    outputs: [\n${outputs}]
});`;
            }
        },
        {
            name: "nodeName",
            dName: "name",
            type: "String",
            integrated: true,
            inputWidth: 40
        },
        {
            name: "nodeInternalName",
            dName: "ID",
            type: "String",
            integrated: true,
            inputWidth: 58
        },
        {
            name: "nodeColor",
            dName: "color",
            type: "rgb",
            display: "rgba(255, 255, 0, 1)"
        },
        {
            name: "nodeWidth",
            dName: "Width",
            type: "Number",
            integrated: true,
            inputWidth: 39
        },
        {
            name: "nodeAlwaysGen",
            dName: "Always Generate",
            type: "Number",
            integrated: true,
            inputWidth: 39
        },
        {
            name: "nodeInputs",
            dName: "Inputs",
            type: "io"
        },
        {
            name: "nodeOutputs",
            dName: "Outputs",
            type: "io"
        }
    ],
    outputs: [
        {
            name: "",
            type: "Connect"
        }
    ]
});

BNodes.blocks.push({
    name: "In Out Combiner",
    internalID: "node_ioc",
    color: "rgba(255, 0, 0, 1)",
    width: 150,
    inputs: [],
    outputs: [
        {
            name: "out",
            dName: "",
            type: "io",
            code: (data) => {
                let ios = "";
                if(data.input.length == 0) return ios;
                for(let io in data.input){
                    if(data.input[io] == "") continue;
                    ios += (ios != "" ? ",\n" : "") + data.input[io];
                }
                return ios;
            }
        }
    ],
    mutators: {
        inputs: {
            code: (mutator) => {
                const idx = "io" + mutator.amount;
                return {
                    dName: "IO",
                    name: idx,
                    type: "Any",
                    code: (data) => {
                        return idx;
                    }
                }
            },
            addType: "In-/Output"
        }
    }
});

BNodes.blocks.push({
    name: "Input/Output Handle",
    internalID: "node_ioh",
    color: "rgba(255, 0, 0, 1)",
    width: 150,
    inputs: [
        {
            name: "Name",
            type: "String",
            integrated: true,
            inputWidth: 40
        },
        {
            name: "dName",
            type: "String",
            integrated: true,
            inputWidth: 40
        },
        {
            name: "type",
            type: "type",
            display: "rgba(255, 0, 0, 1)"
        },
        {
            name: "integrated",
            dName: "Integrated",
            type: "Boolean",
            integrated: true
        },
        {
            name: "hideInput",
            dName: "Hide Input",
            type: "Boolean",
            integrated: true
        },
        {
            name: "width",
            dName: "Input Width",
            type: "Number",
            integrated: true
        },
        {
            name: "containsCode",
            dName: "Has Code",
            type: "Boolean",
            integrated: true
        }
    ],
    outputs: [
        {
            name: "out",
            dName: "",
            type: "io",
            code: (data) => {
                const name = LineBlox._escapeForStr(data.input["Name"]);
                const _integrated = data.input["integrated"];
                const integrated = _integrated == true ? ",\nintegrated: true" : "";
                const _hideInput = data.input["hideInput"];
                const hideInput = _hideInput == true ? ",\nhideInput: true" : "";

                const _inputW = data.input["width"];
                const inputW = (_inputW == "" || _inputW < 10) ? "" : ",\ninputWidth: " + _inputW;

                const _code = data.input["containsCode"];
                const code = _code == true ? ",\ncode: (data) => {\n\n}" : "";

                const _dName = data.input["dName"];
                let dName = LineBlox._escapeForStr(_dName);
                dName = "dName: " + (dName !== "" ? dName : "") + ",\n";

                let type = data.input["type"];
                type = type == "" ? "Any" : type;
                type = LineBlox._escapeForStr(type);
                if(!type.startsWith('"') && !type.startsWith("[") && !type.endsWith("]")) type = `"${type}"`;

                return `{
    name: ${name},
    ${dName}type: ${type}${integrated}${hideInput}${inputW}${code}
}`;
            }
        }
    ]
});

BNodes.blocks.push({
    name: "Type",
    internalID: "node_type_0",
    color: "rgba(255, 0, 0, 1)",
    width: 150,
    inputs: [
        {
            name: "type",
            dName: "Type",
            type: "String",
            integrated: true,
            inputWidth: 40,
            values: _displayVals,
            hideInput: true
        }
    ],
    outputs: [
        {
            name: "out",
            dName: "",
            type: "type",
            display: "rgba(255, 0, 0, 1)",
            code: (data) => {
                const v = data.input["type"];
                return `${v}`;
            }
        }
    ]
});
BNodes.blocks.push({
    name: "Type (Custom)",
    internalID: "node_type_1",
    color: "rgba(255, 0, 0, 1)",
    width: 150,
    inputs: [
        {
            name: "type",
            dName: "Type",
            display: "String",
            type: ["String", "Array"],
            integrated: true,
            inputWidth: 40
        }
    ],
    outputs: [
        {
            name: "out",
            dName: "",
            type: "type",
            display: "rgba(255, 0, 0, 1)",
            code: (data) => {
                const v = data.input["type"];
                return `${v}`;
            }
        }
    ]
});

BNodes.blocks.push({
    name: "RGB",
    internalID: "node_rgb",
    color: "rgba(255, 0, 0, 1)",
    width: 90,
    inputs: [
        {
            name: "r",
            dName: "Red",
            type: "Number",
            integrated: true,
            inputWidth: 40
        },
        {
            name: "g",
            dName: "Green",
            type: "Number",
            integrated: true,
            inputWidth: 29
        },
        {
            name: "b",
            dName: "Blue",
            type: "Number",
            integrated: true,
            inputWidth: 38
        }
    ],
    outputs: [
        {
            name: "out",
            dName: "",
            type: "rgb",
            display: "rgba(255, 255, 0, 1)",
            code: (data) => {
                let r = data.input["r"];
                let g = data.input["g"];
                let b = data.input["b"];
                r = r == "" ? 0 : r;
                g = g == "" ? 0 : g;
                b = b == "" ? 0 : b;
                return `"rgb(${r}, ${g}, ${b})"`;
            }
        }
    ]
});
