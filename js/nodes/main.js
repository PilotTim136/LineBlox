//Main
BNodes.blocks.push({
    name: "Start",
    internalID: "__start__",
    color: "rgb(40, 168, 75)",
    width: 50,
    inputs: [],
    outputs: [
        {
            name: "",
            type: "Connect"
        }
    ]
});

//Loops
BNodes.blocks.push({
    name: "Repeat",
    internalID: "loop_repeat",
    color: "rgba(36, 180, 0, 1)",
    width: 100,
    inputs: [
        {
            name: "",
            type: "Connect",
            code: (data) => {
                const times = data.input["times"] ?? 0;
                const varn = data.input["Variable"]?.replaceAll('"', "") ?? "_var_";
                const con = data.output["Loop"] ?? "";

                return `for(let ${varn} = 0; ${varn} < ${times}; ${varn}++){\n${con}}\n`;
            }
        },
        {
            name: "times",
            type: "Number",
        },
        {
            name: "Variable",
            dName: "var",
            type: "String",
            hideInput: true,
            integrated: true,
            inputWidth: 26
        }
    ],
    outputs: [
        {
            name: "",
            type: "Connect"
        },
        {
            name: "Loop",
            type: "Connect"
        },
        {
            name: "Value",
            type: "Variable",
            code: (data) => {
                return `${data.input["Variable"]?.replaceAll('"', "")}`;
            }
        }
    ]
});
BNodes.blocks.push({
    name: "While",
    internalID: "loop_while",
    color: "rgba(36, 180, 0, 1)",
    width: 100,
    inputs: [
        {
            name: "",
            type: "Connect",
            code: (data) => {
                const varn = data.input["Variable"] ?? "_var_";
                const con = data.output["Loop"] ?? "";

                return `while(${varn}){\n${con}}\n`;
            }
        },
        {
            name: "Variable",
            dName: "Condition",
            type: ["Boolean", "Variable"],
            display: "Boolean"
        }
    ],
    outputs: [
        {
            name: "",
            type: "Connect"
        },
        {
            name: "Loop",
            type: "Connect"
        }
    ]
});
BNodes.blocks.push({
    name: "For each",
    internalID: "loop_foreach",
    color: "rgba(36, 180, 0, 1)",
    width: 100,
    inputs: [
        {
            name: "",
            type: "Connect",
            code: (data) => {
                const varuse = data.input["Array"] ?? 0;
                const varn = data.input["Variable"]?.replaceAll('"', "") ?? "_var_";
                const type = data.input["type"]?.replaceAll('"', "") ?? "";
                const con = data.output["Loop"] ?? "";

                return `for(let ${varn} ${type} ${varuse}){\n${con}}\n`;
            }
        },
        {
            name: "Array",
            type: ["Array", "Variable"],
            display: "Array"
        },
        {
            name: "type",
            hideInput: true,
            integrated: true,
            inputWidth: 13,
            values: [
                { dsp: "of", val: "of" },
                { dsp: "in", val: "in" }
            ]
        },
        {
            name: "Variable",
            dName: "var",
            type: "String",
            hideInput: true,
            integrated: true,
            inputWidth: 50
        }
    ],
    outputs: [
        {
            name: "",
            type: "Connect"
        },
        {
            name: "Loop",
            type: "Connect"
        },
        {
            name: "Value",
            type: "Variable",
            code: (data) => {
                return `${data.input["Variable"]?.replaceAll('"', "")}`;
            }
        }
    ]
});
BNodes.blocks.push({
    name: "Continue",
    internalID: "loop_continue",
    color: "rgba(36, 180, 0, 1)",
    width: 75,
    inputs: [
        {
            name: "",
            type: "Connect",
            code: (data) => {
                return `continue;\n`;
            }
        }
    ],
    outputs: [
        {
            name: "",
            type: "Connect",
            hideInput: true
        }
    ]
});
BNodes.blocks.push({
    name: "Break",
    internalID: "loop_break",
    color: "rgba(36, 180, 0, 1)",
    width: 75,
    inputs: [
        {
            name: "",
            type: "Connect",
            code: (data) => {
                return `break;\n`;
            }
        }
    ],
    outputs: [
        {
            name: "",
            type: "Connect",
            hideInput: true
        }
    ]
});

//Logic
BNodes.blocks.push({
    name: "If",
    internalID: "logic_if",
    color: "rgba(0, 144, 180, 1)",
    width: 100,
    inputs: [
        {
            name: "",
            type: "Connect",
            code: (data) => {
                const cond = data.input["condition"] ?? "false";
                const trueCode = data.output["True"] ?? "invalid";
                const falseCode = data.output["False"] ?? "invalid";
                
                return `if(${cond}){\n${trueCode}}${falseCode ? `else{\n${falseCode}}` : ""}\n`;
            }
        },
        {
            name: "condition",
            type: ["Boolean", "Variable"],
            display: "Boolean"
        }
    ],
    outputs: [
        {
            name: "",
            type: "Connect"
        },
        {
            name: "True",
            type: "Connect"
        },
        {
            name: "False",
            type: "Connect"
        }
    ]
});
BNodes.blocks.push({
    name: "comparison",
    internalID: "logic_comparison",
    color: "rgba(0, 144, 180, 1)",
    width: 100,
    inputs: [
        { name: "in1" },
        { name: "in2" },
        {
            name: "type",
            type: "String",
            values: [
                { dsp: "=", val: "==" },
                { dsp: "!=", val: "!=" },
                { dsp: "and", val: "&&" },
                { dsp: "or", val: "||" }
            ],
            integrated: true,
            hideInput: true
        }
    ],
    outputs: [
        {
            name: "result",
            type: "Boolean",
            code: (data) => {
                const in1 = data.input["in1"] ?? "null";
                const in2 = data.input["in2"] ?? "null";
                const type = data.input["type"];
                
                return `${in1} ${type} ${in2}`;
            }
        }
    ]
});
BNodes.blocks.push({
    name: "not",
    internalID: "logic_not",
    color: "rgba(0, 144, 180, 1)",
    width: 60,
    inputs: [
        {
            name: "in",
            type: "Boolean"
        }
    ],
    outputs: [
        {
            name: "out",
            type: "Boolean",
            code: (data) => {
                const in1 = data.input["in"] ?? "false";
                
                return `!${in1}`;
            }
        }
    ]
});
BNodes.blocks.push({
    name: "bool",
    internalID: "logic_bool",
    color: "rgba(0, 144, 180, 1)",
    width: 60,
    inputs: [],
    outputs: [
        {
            name: "out",
            type: "Boolean",
            integrated: true,
            code: (data) => {
                return `${data.output["out"]}`;
            }
        }
    ]
});
BNodes.blocks.push({
    name: "null",
    internalID: "logic_null",
    color: "rgba(0, 144, 180, 1)",
    width: 50,
    inputs: [],
    outputs: [
        {
            name: "out",
            code: (data) => {                
                return "null";
            }
        }
    ]
});

//Math
BNodes.blocks.push({
    name: "Number",
    internalID: "math_num",
    color: "rgba(0, 72, 180, 1)",
    width: 80,
    inputs: [],
    outputs: [
        {
            name: "out",
            type: "Number",
            integrated: true,
            inputWidth: 60,
            ignoreText: true,
            code: (data) => {
                return `${data.output["out"]}`;
            }
        }
    ]
});
BNodes.blocks.push({
    name: "Operation",
    internalID: "math_operations",
    color: "rgba(0, 72, 180, 1)",
    width: 100,
    inputs: [
        {
            name: "in1",
            integrated: true,
            ignoreText: true,
            inputWidth: 40
        },
        {
            name: "in2",
            integrated: true,
            ignoreText: true,
            inputWidth: 40
        },
        {
            dName: "+ - * / ^",
            name: "type",
            type: "String",
            values: [
                { dsp: "+", val: "+" },
                { dsp: "-", val: "-" },
                { dsp: "*", val: "*" },
                { dsp: "/", val: "/" },
                { dsp: "^", val: "^" }
            ],
            integrated: true,
            hideInput: true,
            ignoreText: true,
            inputWidth: 42
        }
    ],
    outputs: [
        {
            name: "result",
            type: "Number",
            code: (data) => {
                const in1 = data.input["in1"];
                const in2 = data.input["in2"];
                const type = data.input["type"];
                
                return `(${in1} ${type} ${in2})`;
            }
        }
    ]
});

//String
BNodes.blocks.push({
    name: "String",
    internalID: "string_str",
    color: "rgba(207, 125, 2, 1)",
    width: 80,
    inputs: [],
    outputs: [
        {
            name: "str",
            type: "String",
            integrated: true,
            inputWidth: 60,
            ignoreText: true,
            code: (data) => {
                return `"${data.output["str"]}"`;
            }
        }
    ]
});
BNodes.blocks.push({
    name: "Join",
    internalID: "string_join",
    color: "rgba(207, 125, 2, 1)",
    width: 100,
    inputs: [
        {
            name: "in1",
            display: "String",
            type: "Any",
            integrated: true
        },
        {
            name: "in2",
            display: "String",
            type: "Any",
            integrated: true
        }
    ],
    outputs: [
        {
            name: "out",
            type: "String",
            code: (data) => {
                const i1 = data.input["in1"];
                const i2 = data.input["in2"];
                const i1Num = !Number.isNaN(Number(i1));
                const i2Num = !Number.isNaN(Number(i2));

                return `${LineBlox.wrapStr(i1, i1Num)} + ${LineBlox.wrapStr(i2, i2Num)}`;
            }
        }
    ]
});
BNodes.blocks.push({
    name: "Print",
    internalID: "string_print",
    color: "rgba(207, 125, 2, 1)",
    width: 150,
    inputs: [
        {
            name: "",
            type: "Connect",
            code: (data) => {
                const msg = data.input["Message"];
                const msgNum = Number.isNaN(Number(msg));
                return `console.log(${LineBlox.wrapStr(msg, msgNum)});\n`;
            }
        },
        {
            name: "Message",
            inputWidth: 70,
            integrated: true
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
    name: "Prompt",
    internalID: "string_prompt",
    color: "rgba(207, 125, 2, 1)",
    width: 150,
    inputs: [
        {
            name: "Message",
            display: "String"
        }
    ],
    outputs: [
        {
            name: "Value",
            type: "String",
            code: (data) => {
                const msg = data.input["Message"];
                const msgNum = Number.isNaN(Number(msg));
                return `prompt(${LineBlox.wrapStr(msg, msgNum)})`;
            }
        }
    ]
});

//Array
BNodes.blocks.push({
    name: "Create Array",
    internalID: "array_create",
    color: "rgba(109, 0, 182, 1)",
    width: 150,
    inputs: [],
    outputs: [
        {
            name: "Array",
            display: "Variable",
            type: "Array",
            code: (data) => {
                let things = "";
                for(let item in data.input){
                    if(!item.startsWith("listItem")) continue;
                    things += (things != "" ? ", " : "") + data.input[item];
                }
                return `[${things}]`;
            }
        }
    ],
    mutators: {
        inputs: {
            code: (mutator) => {
                const idx = "listItem" + mutator.amount;
                return {
                    dName: "Item",
                    name: idx,
                    type: "Any",
                    code: (data) => {
                        return idx;
                    }
                }
            },
            addType: "Item"
        }
    }
});
BNodes.blocks.push({
    name: "Get Array Value",
    internalID: "array_getValueIndex",
    color: "rgba(109, 0, 182, 1)",
    width: 100,
    inputs: [
        {
            name: "Array",
            display: "rgba(147, 42, 218, 1)",
            type: ["Variable", "Array"]
        },
        {
            name: "Index",
            type: "Number",
            integrated: true
        }
    ],
    outputs: [
        {
            name: "Value",
            display: "Any",
            type: ["Any", "Variable"],
            code: (data) => {
                return `${data.input["Array"]}[${data.input["Index"]}]`;
            }
        }
    ]
});

//Variables
BNodes.blocks.push({
    name: "Initialize Variable",
    internalID: "var_init",
    color: "rgba(145, 24, 175, 1)",
    width: 165,
    inputs: [
        {
            name: "",
            type: "Connect",
            code: (data) => {
                const v = data.input["Value"];
                return `${data.input["type"]} ${data.input["Name"].replaceAll("\"", "")}${v != "\"\"" ? (" = " + v) : ""};\n`;
            }
        },
        {
            name: "type",
            type: "String",
            values: [
                { dsp: "constant", val: "const" },
                { dsp: "changing", val: "let" }
            ],
            integrated: true,
            hideInput: true,
            inputWidth: 70
        },
        {
            name: "Name",
            type: "Any",
            integrated: true,
            hideInput: true,
            inputWidth: 70
        },
        {
            name: "Value"
        }
    ],
    outputs: [
        {
            name: "",
            type: "Connect"
        },
        {
            name: "Value",
            type: "Variable",
            code: (data) => {
                return `${data.input["Name"]}`;
            }
        }
    ]
});
BNodes.blocks.push({
    name: "Set Variable",
    internalID: "var_set",
    color: "rgba(145, 24, 175, 1)",
    width: 165,
    inputs: [
        {
            name: "",
            type: "Connect",
            code: (data) => {
                const v = data.input["Value"];
                return `${data.input["Name"].replaceAll("\"", "")} = ${v};\n`;
            }
        },
        {
            name: "Name",
            type: "Any",
            integrated: true,
            hideInput: true,
            inputWidth: 70
        },
        {
            name: "Value"
        }
    ],
    outputs: [
        {
            name: "",
            type: "Connect"
        },
        {
            name: "Value",
            type: "Variable",
            code: (data) => {
                return `${data.input["Name"]}`;
            }
        }
    ]
});
BNodes.blocks.push({
    name: "Get Variable",
    internalID: "var_get",
    color: "rgba(145, 24, 175, 1)",
    width: 100,
    inputs: [
        {
            name: "Name",
            type: "Any",
            integrated: true,
            hideInput: true,
            ignoreText: true,
            inputWidth: 30
        }
    ],
    outputs: [
        {
            name: "Value",
            display: "Variable",
            type: ["Any", "Variable"],
            code: (data) => {
                return `${data.input["Name"]}`;
            }
        }
    ]
});

//Functions
BNodes.blocks.push({
    name: "Define Function",
    internalID: "func_def",
    color: "rgba(124, 22, 150, 1)",
    width: 165,
    inputs: [
        {
            name: "",
            type: "Connect",
            code: (data) => {
                const name = data.input["Name"].replaceAll("\"", "");
                let params = "";
                for(let _n in data.inputs){
                    if(!_n.startsWith("param")) continue;
                    let value = data.inputs[_n];
                    params += (params != "" ? ", " : "") + value;
                }
                const func = data.output["func"] ?? "";
                return `function ${name}(${params.replaceAll("\"", "")}){\n${func}}\n`;
            }
        },
        {
            name: "Name",
            type: "Any",
            integrated: true,
            hideInput: true,
            inputWidth: 70
        }
    ],
    outputs: [
        {
            name: "",
            type: "Connect"
        },
        {
            name: "func",
            type: "Connect"
        }
    ],
    mutators: {
        inputs: {
            code: (mutator) => {
                const idx = "param" + mutator.amount;
                return {
                    dName: "Parameter",
                    name: idx,
                    type: "Any",
                    integrated: true,
                    hideInput: true,
                    inputWidth: 70,
                    code: (data) => {
                        return idx;
                    }
                }
            },
            addType: "Parameter"
        }
    }
});
BNodes.blocks.push({
    name: "Return",
    internalID: "func_ret",
    color: "rgba(124, 22, 150, 1)",
    width: 100,
    inputs: [
        {
            name: "",
            type: "Connect",
            code: (data) => {
                const val = data.input["Value"];
                return `return ${val};\n`;
            }
        },
        {
            name: "Value",
            type: "Any"
        }
    ],
    outputs: [
        {
            name: "",
            type: "Connect",
            hideInput: true
        }
    ]
});
BNodes.blocks.push({
    name: "Call Function",
    internalID: "func_call",
    color: "rgba(124, 22, 150, 1)",
    width: 165,
    inputs: [
        {
            name: "",
            type: "Connect",
            code: (data) => {
                const name = data.input["Name"].replaceAll("\"", "");
                let params = "";
                for(let _n in data.inputs){
                    if(!_n.startsWith("param")) continue;
                    let value = data.inputs[_n];
                    params += (params != "" ? ", " : "") + `${value}`;
                }
                return `${name}(${params});\n`;
            }
        },
        {
            name: "Name",
            type: "Any",
            integrated: true,
            hideInput: true,
            inputWidth: 70
        }
    ],
    outputs: [
        {
            name: "",
            type: "Connect"
        }
    ],
    mutators: {
        inputs: {
            code: (mutator) => {
                const idx = "param" + mutator.amount;
                return {
                    dName: "Parameter",
                    name: idx,
                    type: "Any",
                    code: (data) => {
                        return idx;
                    }
                }
            },
            addType: "Parameter"
        }
    }
});
BNodes.blocks.push({
    name: "Call Function",
    internalID: "func_callRetVal",
    color: "rgba(124, 22, 150, 1)",
    width: 165,
    inputs: [
        {
            name: "Name",
            type: "Any",
            integrated: true,
            hideInput: true,
            inputWidth: 70
        }
    ],
    outputs: [
        {
            name: "out",
            display: "Any",
            type: ["Any", "Variable"],
            code: (data) => {
                const name = data.input["Name"];
                let params = "";
                for(let _n in data.inputs){
                    if(!_n.startsWith("param")) continue;
                    let value = data.inputs[_n];
                    params += (params != "" ? ", " : "") + `${value}`;
                }
                return `${name}(${params})`;
            }
        }
    ],
    mutators: {
        inputs: {
            code: (mutator) => {
                const idx = "param" + mutator.amount;
                return {
                    dName: "Parameter",
                    name: idx,
                    type: "Any",
                    code: (data) => {
                        return idx;
                    }
                }
            },
            addType: "Parameter"
        }
    }
});
