//DO NOT INCLUDE IN HTML

const fs = require("fs");

//////////////////////////
//                      //
//       SETTINGS       //
//                      //
//////////////////////////

//will generate like: "lineblox-1.0.0.js"
const major = 1;
const minor = 0;
const patch = 0;

//files (IN ORDER)
const inputFiles = [
    "js/editor.js",
    "js/node.js",
    "js/nodeHelper.js",
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

fs.writeFileSync(`js/combined/lineblox-${major}.${minor}.${patch}.js`, code);
