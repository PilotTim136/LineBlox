//DO NOT INCLUDE IN HTML

const fs = require("fs");

//////////////////////////
//                      //
//       SETTINGS       //
//                      //
//////////////////////////

//will generate like: "lineblox-1.0.0.js"
const version = "1.2.0";

const isBeta = false;

//files (IN ORDER)
const inputFiles = [
    "js/editorConfig.js",
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

const betaStr = isBeta ? "-BETA" : "";

fs.writeFileSync(`versions/lineblox-${version}${betaStr}.js`, code);  //set version numbers
console.log(`Created: ${version}${betaStr}`);
fs.writeFileSync(`versions/lineblox-latest${betaStr}.js`, code);      //make this latest version
console.log(`Created: latest${betaStr}`);
