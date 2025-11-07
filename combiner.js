//DO NOT INCLUDE IN HTML

const fs = require("fs");

//////////////////////////
//                      //
//       SETTINGS       //
//                      //
//////////////////////////

//will generate like: "lineblox-1.0.0.js"
const major = 1;
const minor = 1;
const patch = 0;

const isBeta = true;

//files (IN ORDER)
const inputFiles = [
    "js/editor.js",
    "js/node.js",
    "js/nodeHelper.js",
    "js/plugin.js",
    "js/scrollbar.js",
    "js/toolbox.js"
];


//////////////////////////
//                      //
//         CODE         //
//                      //
//////////////////////////

let code = "";

for(const f of inputFiles){
    let content = fs.readFileSync(f, "utf-8");

    content = content.replace(/\/\*[\s\S]*?\*\//g, "");

    content = content.replace(/\/\/.*$/gm, "");

    content = content.replace(/^\s*[\r\n]/gm, "");

    code += content + "\n";
}

fs.writeFileSync(`versions/lineblox-${major}.${minor}.${patch}${isBeta ? "-BETA" : ""}.js`, code);
