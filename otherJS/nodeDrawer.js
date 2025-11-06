//for the "creator.html" for easy node creation :)
function getColFromType(ct){
    if (typeof ct === "string" && (ct.startsWith("#") || ct.startsWith("rgb"))) {
        return ct;
    }

    ct = (ct ?? "").toString().toLowerCase();;
    let col = "white";
    switch(ct){
        case "string":
            col = "orange";
            break;
        case "number":
        case "integer":
        case "float":
            col = "lightgreen";
            break;
        case "boolean":
            col = "rgba(0, 89, 255, 1)";
            break;
        case "variable":
            col = "purple";
            break;
        default:
            col = "white";
            break;
    }
    return col;
}


let name = "<unnamed>";
let internalID = "node_internal_unnamed";
let width = 100;
/** @type {CanvasRenderingContext2D} */
let ctx = null;
/** @type {HTMLCanvasElement} */
let canvas = null;
let nodeColor = "rgba(255, 145, 0, 1)";

let inputs = [];
let outputs = [];

let cFrame = 0;

function drawTriangle(ctx, px, py, psize){ BNode._drawTriangle(ctx, px, py, psize) }

function _setup(){
    canvas = document.getElementById("nodeDraw");
    canvas.width = 200;
    canvas.height = 200;
    ctx = canvas?.getContext("2d");
}

function GenCode(){
    const codeRaw = LBInst.GenerateCode()
        .replace("BNodes.blocks.push(", "")
        .replace(");", "")
        .replace(/code\s*:\s*\([^)]*\)\s*=>\s*\{[^}]*\}/g, "code: null")
        .replace(/(\w+)\s*:/g, '"$1":')
        .replace(/:\s*,/g, ': null,')
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']');
    let doReturn = false;
    
    const c = codeRaw == "" ? doReturn = true : codeRaw;

    if(doReturn) return;

    const code = JSON.parse(c);
    name = code.name ?? "<unnamed>";
    internalID = code.internalID ?? "node_internal_id_unnamed";
    nodeColor = code.color ?? "rgba(255, 145, 0, 1)";
    width = code.width ?? 100;
    inputs = code.inputs;
    outputs = code.outputs;
}

function draw(){
    if(!ctx){
        _setup();
        return;
    }
    if(cFrame > 30) GenCode();
    cFrame++;
    ctx.fillStyle = "black";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const w = width;
    let x = 10;
    let y = 10;
    const fontSize = 12;
    const nodeConSpace = 15;
    const baseOffset = 30;
    let maxIO = Math.max(inputs.length, outputs.length);
    let h = baseOffset;
    h = baseOffset + 5 + maxIO * 15;

    const rounding = 5;
    const grad = ctx.createRadialGradient(x, y, w, x, y, 5);
    grad.addColorStop(1, nodeColor);
    grad.addColorStop(0, ColUtil.darkenColor(nodeColor, 40));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, w, 20, [rounding, rounding, 0, 0]);
    ctx.fill();

    ctx.beginPath();
    ctx.globalAlpha = 0.5;
    ctx.roundRect(x, y + 20, w, h - 20, [0, 0, rounding, rounding]);
    ctx.fill();
    ctx.globalAlpha = 1;

    let offsetY = 0;

    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "white";
    ctx.font = "15px Sans-Serif";
    ctx.fillText(name, x + w / 2, y + 5, w);

    const r = 5;
    const defCol = "rgb(255, 255, 255)";
    
    offsetY = 0;
    ctx.textBaseline = "middle";
    for(let input of inputs){
        const by = y + baseOffset + offsetY;

        ctx.fillStyle = "white";
        ctx.font = fontSize + "px Sans-Serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        const text = input.dName;
        ctx.fillText(text, x + 10, by, w / 2);

        let inputColor = getColFromType(input.display ? input.display : !Array.isArray(input.type) ? input.type : defCol);
        if(input.type == "Connect") drawTriangle(ctx, x + 1, by - 5.5, 11);
        else{
            ctx.fillStyle = inputColor;
            ctx.beginPath();
            ctx.arc(x, by, r, 0, 2 * Math.PI);
            ctx.fill();
        }

        offsetY += nodeConSpace;
        by_ = by;
    }
    ctx.fillStyle = "white";

    offsetY = 0;
    nx_ = 0;
    for(let output of outputs){
        if(output.hideInput) continue;
        const nx = x + w - 10;
        const by = y + baseOffset + offsetY;

        let inputColor = getColFromType(output.display ? output.display : !Array.isArray(output.type) ? output.type : defCol);
        if(output?.type == "Connect") drawTriangle(ctx, nx + 11, by - 5.5, 11);
        else{
            ctx.fillStyle = inputColor;
            ctx.beginPath();
            ctx.arc(nx + 10, by, r, 0, 2 * Math.PI);
            ctx.fill();
        }
        offsetY += nodeConSpace;
        by_ = by;
        nx_ = nx;
    }
}
