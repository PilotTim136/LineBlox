const tb = [
    {
        category: "Main",
        color: "green",
        blocks: [
            "__start__"
        ]
    },
    {
        category: "Loops",
        color: "rgba(36, 180, 0, 1)",
        blocks: [
            "loop_repeat", "loop_while", "loop_foreach", "loop_continue", "loop_break"
        ]
    },
    {
        category: "Logic",
        color: "rgba(0, 144, 180, 1)",
        blocks: [
            "logic_if", "logic_comparison", "logic_not", "logic_bool", "logic_null"
        ]
    },
    {
        category: "Math",
        color: "rgba(0, 72, 180, 1)",
        blocks: [
            "math_num", "math_operations"
        ]
    },
    {
        category: "String",
        color: "rgba(207, 125, 2, 1)",
        blocks: [
            "string_str", "string_join", "string_print", "string_prompt"
        ]
    },
    {
        category: "Arrays",
        color: "rgba(109, 0, 182, 1)",
        blocks: [
            "array_create", "array_getValueIndex"
        ]
    },
    {
        category: "Variables",
        color: "rgba(145, 24, 175, 1)",
        blocks: [
            "var_init", "var_set", "var_get"
        ]
    },
    {
        category: "Functions",
        color: "rgba(124, 22, 150, 1)",
        blocks: [
            "func_def", "func_ret", "func_call", "func_callRetVal"
        ]
    }
];

const config = new LineBloxConfig();
config.offsets.left = 0;
config.offsets.right = 0;
config.offsets.top = 40;

config.toolbox.tbNodes = tb;
config.toolbox.toolboxW = 300;

const LBInst = new LineBlox(null, config);
await LBInst.EnablePluginSupport("js/nodes/plugins/", "pluginDefs.jsonc");
