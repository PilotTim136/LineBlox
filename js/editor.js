let BNodes = {blocks: [], toolbox: {}};

class LineBlox{
    #canvas;
    #ctx;
    #startingBlock = "__start__";

    #mouseX = 0;
    #mouseY = 0;
    #mouseDown = false;
    #dragging = false;
    /** @type {BNode | null} */
    draggingNode = null;
    /** @type {Object | null} */
    draggingNodePoint = null;
    /** @type {Object | null} */
    #prevDraggingNodePoint = null;

    draggingScrollbarX = false;
    draggingScrollbarY = false;

    #xOffset = 0;
    #xnOffset = 0;
    #yOffset = 0;
    #tbTotalOffset = 0;

    #frame = 0;

    scrollX = 0;
    scrollY = 0;
    scrollBarX = 0;
    scrollBarY = 0;
    scrollBarXOffset = 0;
    scrollBarYOffset = 0;

    scrollIntensityX = 1;
    scrollIntensityY = 1;

    interacted = false;

    /** @type {Function} Callback when draw() was called */
    updateCallback = null;

    toolbox = {
        usingTB: false,
        /** @type {HTMLCanvasElement} */
        canvas: null,
        /** @type {CanvasRenderingContext2D} */
        ctx: null,
        size: { x: 0, y: 0 },
        mousePos: { x: 0, y: 0 },
        clickedFrame: false,
        selected: -1,
        draggingNodeID: null,
        scrollBarY: 0,
        draggingScrollbarY: false,
        scrollBarYOffset: 0,
        scrollY: 0
    };

    get mouseX(){ return this.#mouseX }
    get mouseY(){ return this.#mouseY }
    get mouseDown(){ return this.#mouseDown }
    get dragging(){ return this.#dragging }
    get prevDraggingNodePoint(){ return this.#prevDraggingNodePoint }
    get ctx(){ return this.#ctx }
    get yOffset(){ return this.#yOffset }
    get xOffset(){ return this.#xOffset }
    get xnOffset(){ return this.#xnOffset }
    get canvas(){ return this.#canvas }
    get tbOffset(){ return this.#tbTotalOffset }

    IsMouseAvailable(){
        return this.#mouseDown && !(this.draggingNode || this.draggingNodePoint || this.#dragging || this.interacted || this.#dragBg);
    }

    #htmlctx = null;

    connected = false;

    /** FancyDraw settings - used for nice visuals
     * 
     * Might impact performance with many nodes!
     */
    fancyDraw = {
        nodes: true,
        lines: {
            enabled: true,
            glowLines: true,
            gradientGlow: true
        },
        nodeHead: {
            gradients: true,
            darkerAmount: 40
        }
    };


    /** @type {Array<BNode>} */
    nodes = [];

    static drawDragNode(ctx, node, largestW, cy, inst, fontSize = 15, lw = 0, centerNode = false, x){
        let w = lw != 0 ? (node.width > lw ? lw : node.width) : node.width;
        let h = 30;
        let offsetY = 0;
        let maxIO = Math.max(node.inputs.length, node.outputs.length);
        h = h + 5 + maxIO * 15;
        let _x = largestW + 10 + (centerNode ? (x - largestW - 20 - w)/2 : 0);

        const rounding = 5;
        ctx.fillStyle = node.color;
        if(inst.fancyDraw.nodes){
            if(inst.fancyDraw.nodeHead.gradients){
                const grad = ctx.createRadialGradient(_x, cy, w, _x, cy, 5);
                grad.addColorStop(1, node.color);
                grad.addColorStop(0, ColUtil.darkenColor(node.color, inst.fancyDraw.nodeHead.darkerAmount ?? 40));
                ctx.fillStyle = grad;
            }
            ctx.beginPath();
            ctx.roundRect(_x, cy, w, 20, [rounding, rounding, 0, 0]);
            ctx.fill();

            ctx.beginPath();
            ctx.globalAlpha = 0.5;
            ctx.roundRect(_x, cy + 20, w, h - 20, [0, 0, rounding, rounding]);
            ctx.fill();
            ctx.globalAlpha = 1;
        }else ctx.fillRect(_x, cy, w, h);
        ctx.fillStyle = "white";

        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = "white";
        ctx.font = "15px Sans-Serif";
        ctx.fillText(node.name, _x + w / 2, cy + 5, w);

        offsetY = 0;
        for(let input of node.inputs){
            const by = cy + 30 + offsetY;

            ctx.font = fontSize + "px Sans-Serif";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillText(`${input.name}`, _x + 10, by, w / 2);

            if(input.type == "Connect") BNode._drawTriangle(ctx, _x + 1, by - 5.5, 11);
            else{
                ctx.beginPath();
                ctx.arc(_x, by, 5, 0, 2 * Math.PI);
                ctx.fill();
            }

            offsetY += 15;
        }

        offsetY = 0;
        for(let output of node.outputs){
            const nx = _x + w - 10;
            const by = cy + 30 + offsetY;

            if(output.hideInput) continue;
            if(output.type == "Connect") BNode._drawTriangle(ctx, nx + 11, by - 5.5, 11);
            else{
                ctx.beginPath();
                ctx.arc(nx + 10, by, 5, 0, 2 * Math.PI);
                ctx.fill();
            }
            
            ctx.font = fontSize + "px Sans-Serif";
            ctx.textAlign = "right";
            ctx.textBaseline = "middle";
            const text = `${output.name} ${(output.type !== "Any" && output.type !== "Connect" && output.intergrated) ? "(" + output.type + ")" : ""}`;
            ctx.fillText(text, nx, by, w / 2);

            offsetY += 15;
        }
        return h;
    }

    drawGrid(){
        const gridSize = 30;
        const step = gridSize * 1;

        this.#ctx.strokeStyle = "#555"; 
        this.#ctx.lineWidth = 1;

        for(let x = (-this.scrollBarX * this.scrollIntensityX) % step; x < this.#canvas.width; x += step){
            this.#ctx.beginPath();
            this.#ctx.moveTo(x, 0);
            this.#ctx.lineTo(x, this.#canvas.height);
            this.#ctx.stroke();
        }

        for(let y = (-this.scrollBarY * this.scrollIntensityY) % step; y < this.#canvas.height; y += step){
            this.#ctx.beginPath();
            this.#ctx.moveTo(0, y);
            this.#ctx.lineTo(this.#canvas.width, y);
            this.#ctx.stroke();
        }
    }

    //for the broken code
    //currently unused
    #dragBgX = 0;
    #dragBgY = 0;
    #dragSSX = 0;   //dragScrollStartX
    #dragSSY = 0;   //dragScrollStartY
    #dragBg = false;

    /**
     * Can be used for node-internal system for string-checks.
     * @param {String} v The string that will be checked
     * @param {boolean} isNum If the string is a number
     * @returns 
     */
    static wrapStr(v, isNum){
        if(v === undefined || v === null) return undefined; 
        if(isNum) return v;
        if((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))){
            return v;
        }
        return `"${v}"`;
    }

    drawLoop = (execReqFrame = false) => {
        const ctx = this.#ctx;
        ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
        this.drawGrid();

        if(this.draggingNode != null || this.draggingNodePoint != null || this.draggingScrollbarX || this.draggingScrollbarY) this.#dragging = true;
        else this.#dragging = false;
        if(!this.#mouseDown){
            if(this.draggingNodePoint){
                this.#prevDraggingNodePoint = this.draggingNodePoint;
                this.draggingNodePoint = null;
            }
            else if(this.#prevDraggingNodePoint && !this.draggingNodePoint) this.#prevDraggingNodePoint = null;
        }

        let maxX = 0;
        let maxY = 0;
        const bD = 50;  //baseDinstance
        for (let node of this.nodes.slice()) {
            node.draw(ctx);
            const x = (node.x + node.width) + bD - this.#canvas.width;
            const y = (node.y + node.height) + bD - this.#canvas.height;
            if(x > maxX){
                maxX = x;
            }
            if(y > maxY){
                maxY = y;
            }
        }
        this.scrollX = maxX;
        this.scrollY = maxY;
        this.drawScrollbar(this);

        if(this.#mouseDown && !this.#dragging){
            if(this.#frame > 1){
                this.#mouseDown = false;
                this.#frame = 0;
            }else
                this.#frame++;
        }else{
            this.#frame = 0;
        }

        if(this.toolbox.draggingNodeID){
            this.#ctx.globalAlpha = 0.5;
            LineBlox.drawDragNode(this.#ctx, this.toolbox.draggingNodeID, this.#mouseX - 10, this.#mouseY, this, 15);
            this.#ctx.globalAlpha = 1;
        }

        this.drawToolbox(this);
        this.toolbox.clickedFrame = false;

        //a little broken
        /*if(this.IsMouseAvailable()){
            this.#dragging = true;
            this.#dragBg = true;
            this.#dragBgX = this.#mouseX;
            this.#dragBgY = this.#mouseY;
            this.#dragSSX = this.scrollBarX;
            this.#dragSSY = this.scrollBarY;
        }
        if(this.#dragBg){
            const dx = this.#mouseX - this.#dragBgX;
            const dy = this.#mouseY - this.#dragBgY;

            this.scrollBarX = this.#dragSSX - dx;
            this.scrollBarY = this.#dragSSY - dy;

            if(this.scrollBarX < 0) this.scrollBarX = 0;
            else if(this.scrollBarX > this.scrollX) this.scrollBarX = this.scrollX;
            if(this.scrollBarY < 0) this.scrollBarY = 0;
            else if(this.scrollBarY > this.scrollY) this.scrollBarY = this.scrollY;
        }*/

        if(this.updateCallback)
            this.updateCallback();

        if(execReqFrame)
            requestAnimationFrame(this.drawLoop);
    }

    #getMousePosition(event) {
        let rect = this.#canvas.getBoundingClientRect();
        this.#mouseX = event.clientX - rect.left;
        this.#mouseY = event.clientY - rect.top;
    }

    generateNode(node, clone = false){
        let inputs = node.inputs.map(h => new NodeIOHandle(h.name, h.dName ?? null, h.code ?? null, h.values, h.display, h.type ?? "Any",
            h.integrated ?? false, h.hideInput ?? false, h.inputWidth ?? 0, h.ignoreText ?? false));
        let outputs = node.outputs.map(h => new NodeIOHandle(h.name, h.dName ?? null, h.code ?? null, h.values,h.display, h.type ?? "Any",
            h.integrated ?? false, h.hideInput ?? false, h.inputWidth ?? 0, h.ignoreText ?? false));

        return new BNode(node.name, node.internalID, inputs, outputs, this.#mouseX + this.scrollBarX * this.scrollIntensityX,
            this.#mouseY + this.scrollBarY * this.scrollIntensityY, node.color ?? "#eb8634", node.width ?? 200, this,
            node.mutators ?? {}, node.alwaysGenerate ?? false, undefined, clone ?? false);
    }

    callCtxMenu(e, prevCon = null, clickedNode = null){
        if(this.#htmlctx != null){
            document.body.removeChild(this.#htmlctx);
            this.#htmlctx = null;
        }

        const ctx = document.createElement("div");
        ctx.style.position = "absolute";
        ctx.style.left = this.#mouseX + this.#tbTotalOffset + "px";
        ctx.style.top = this.#mouseY + this.#yOffset + "px";
        ctx.style.padding = "10px";
        ctx.style.backgroundColor = "rgb(39, 39, 39)";
        ctx.style.minWidth = "5px";
        ctx.style.minHeight = "5px";
        ctx.style.maxHeight = "200px";
        ctx.style.borderRadius = "10px";

        this.draggingScrollbarX = false;
        this.draggingScrollbarY = false;

        const ctxc = document.body.appendChild(ctx);
        if(clickedNode){
            const options = [
                { name: "Delete", action: () => {
                    clickedNode.remove();
                }},
                { name: "Duplicate", action: () => {
                    clickedNode.clone();
                }}
            ];

            for(const opt of options){
                const btn = document.createElement("div");
                btn.textContent = opt.name;
                btn.style.color = "rgba(226,226,226,1)";
                btn.style.padding = "4px 6px";
                btn.style.cursor = "pointer";
                btn.style.fontSize = "14px";
                btn.addEventListener("mouseenter", () => btn.style.backgroundColor = "rgb(60,60,60)");
                btn.addEventListener("mouseleave", () => btn.style.backgroundColor = "transparent");
                btn.addEventListener("click", () => {
                    opt.action();
                    document.body.removeChild(ctxc);
                    this.#htmlctx = null;
                });
                ctxc.appendChild(btn);
            }
        }else{
            for(const category of BNodes.toolbox){
                const catBtn = document.createElement("div");
                catBtn.textContent = category.category + " ▶";
                catBtn.style.fontSize = "14px";
                catBtn.style.color = category.color ?? "rgba(226, 226, 226, 1)";
                catBtn.style.padding = "2px";
                catBtn.style.cursor = "pointer";
                catBtn.style.position = "relative";
                catBtn.style.userSelect = "none";

                ctxc.appendChild(catBtn);

                const subMenu = document.createElement("div");
                subMenu.style.position = "absolute";
                subMenu.style.fontSize = "14px";
                subMenu.style.left = "100%";
                subMenu.style.top = "0";
                subMenu.style.backgroundColor = "rgb(50, 50, 50)";
                subMenu.style.borderRadius = "5px";
                subMenu.style.display = "none";
                subMenu.style.padding = "5px";
                subMenu.style.minWidth = "120px";
                catBtn.appendChild(subMenu);

                for(const nodeName of category.blocks){
                    const node = BNodes.blocks.find(n => n.internalID === nodeName);
                    if(!node) continue;

                    const nodeBtn = document.createElement("div");
                    nodeBtn.textContent = node.name;
                    nodeBtn.style.color = "rgba(226, 226, 226, 1)";
                    nodeBtn.style.padding = "3px";
                    nodeBtn.style.fontSize = "14px";
                    nodeBtn.style.cursor = "pointer";
                    nodeBtn.style.userSelect = "none";

                    nodeBtn.addEventListener("mouseenter", () => nodeBtn.style.backgroundColor = "rgb(70, 70, 70)");
                    nodeBtn.addEventListener("mouseleave", () => nodeBtn.style.backgroundColor = "transparent");

                    nodeBtn.addEventListener("click", () => {
                        const bNode = this.generateNode(node);

                        if(prevCon != null){
                            const p = prevCon;
                            p.output.connection = null;

                            const c = new NodeConnection(bNode, p.node, p.output.name, bNode.name);
                            if(bNode.inputs[0].type === "Connect") p.output.connection = c;
                            else console.warn("Can't create connection: input[0].type is not \"Connect\".");
                        }

                        if(this.#htmlctx != null){
                            document.body.removeChild(this.#htmlctx);
                            this.#htmlctx = null;
                        }
                    });

                    subMenu.appendChild(nodeBtn);
                }

                catBtn.addEventListener("mouseenter", () => subMenu.style.display = "block");
                catBtn.addEventListener("mouseleave", () => subMenu.style.display = "none");
            }
        }

        if(e) ctxc.addEventListener("contextmenu", (e) => e.preventDefault());
        this.#htmlctx = ctxc;
    }

    GenerateCodeFromNode(node, currentCursive = 0){
        /** @param {BNode} node */
        const resolveOutput = (node, outputName, seen = new Set()) => {
            if(!node) return "";
            if(!node.uuid) return "";
            
            const seenKey = node.uuid + ":" + outputName;
            if(seen.has(seenKey)) return "";
            seen.add(seenKey);

            let data = {
                input: {},
                output: {}
            };

            for(let inp of node.inputs || []){
                if(!inp || inp.name === "") continue;

                if(!inp.connection){
                    if(inp.type === "String" && !inp.values) data.input[inp.name] = `"${inp.value}"`;
                    else data.input[inp.name] = inp.value;
                }else{
                    const fromNode = inp.connection.from;
                    const fromOutputName = inp.connection.fromName;
                    if(!fromNode || !fromOutputName){
                        data.input[inp.name] = "";
                    }else{
                        data.input[inp.name] = resolveOutput(fromNode, fromOutputName);
                    }
                }
            }

            for(let out of node.outputs || []){
                if(out.isMutated === false && typeof out.code === "function") {
                    const result = out.code({ input: {}, output: {} });
                    for(const key in result){
                        if(!(key in data.output)) data.output[key] = result[key];
                    }
                }
            }
            for (let out of node.outputs || []) {
                if(!out || !out.name) continue;

                try{
                    if(out.type === "Connect"){
                        if(out.connection){
                            const downstreamNode = out.connection.to;
                            data.output[out.name] = downstreamNode
                                ? this.GenerateCodeFromNode(downstreamNode, currentCursive+1)
                                : "";
                        }else{
                            data.output[out.name] = "";
                        }
                    }else{
                        if(out.value !== undefined){
                            data.output[out.name] = out.value;
                            data.output["name"] = out.name;
                        }else if(typeof out.code === "function"){
                            data.output[out.name] = out.code(data);
                        }else{
                            data.output[out.name] = "";
                        }
                    }
                }catch(e){
                    console.error("[resolveOutput] error evaluating out", out.name, e);
                    data.output[out.name] = "";
                }
            }

            data.inputs = data.input;
            data.outputs = data.output;

            const outObj = (node.outputs || []).find(o => o.name === outputName);
            if(!outObj) return "";

            if(typeof outObj.code === "function"){
                try{
                    for(let out of node.outputs || []){
                        if(!out || !out.name) continue;

                        if(out.type === "Connect"){
                            if(out.connection) {
                                const outputNode = out.connection.from;
                                data.output[out.name] = this.GenerateCodeFromNode(outputNode, currentCursive+1);
                            }else{
                                data.output[out.name] = "";
                            }
                        }else{
                            data.output[out.name] = out.value ?? (typeof out.code === "function" ? out.code(data) : "");
                        }
                    }
                    return outObj.code(data);
                }catch(e){
                    console.error("Error in outObj.code for", node, outputName, e);
                    return "";
                }
            }

            return outObj.value ?? "";
        }

        /** @type {BNode} */
        let lastCon = node;
        let totalCode = "";
        while(lastCon != null){
            const con = lastCon.outputs ? (lastCon.outputs.length < 1 ? null : lastCon.outputs[0]) : null;
            if(!con){
                lastCon = null;
                break;
            }

            const incon = lastCon.inputs[0];    //this is the connection (triangle on the input-side)
            let givingCodeData = {
                input: {},
                output: {}
            };

            
            for(let inp of lastCon.inputs || []){
                if(!inp || inp.name == "") continue;

                if(!inp.connection){
                    if(inp.type === "String" && !inp.values) givingCodeData.input[inp.name] = `"${inp.value}"`;
                    else givingCodeData.input[inp.name] = inp.type !== "Any" ? inp.value : `"${inp.value}"`;
                }else{
                    const fromNode = inp.connection.from;
                    const fromOutputName = inp.connection.fromName;
                    if(!fromNode || !fromOutputName){
                        givingCodeData.input[inp.name] = "";
                    }else{
                        try{
                            givingCodeData.input[inp.name] = resolveOutput(fromNode, fromOutputName); 
                        }catch(e){
                            throw new Error("Error generating code from resolveOutput: " + e);
                        }
                    }
                }
            }
            for(let out of lastCon.outputs){
                if(out.name == "") continue;
                
                if(out.connection == null) givingCodeData["output"][out.name] = "";
                else{
                    const outputObj = out.connection.from;
                    let result = null;
                    try{
                        result = this.GenerateCodeFromNode(outputObj, currentCursive+1);
                    }catch(e){
                        throw new Error("Error generating code from node: " + e);
                    }
                    givingCodeData["output"][out.name] = result;
                }
            }

            givingCodeData.inputs = givingCodeData.input;
            givingCodeData.outputs = givingCodeData.output;

            const code = incon ? (incon.code ? incon.code(givingCodeData) : "") : "";

            function indentCode(code, indentLevel) {
                if (indentLevel < 0) indentLevel = 0;
                let currentIndent = indentLevel;
                const lines = code.split("\n");
                return lines.map(line => {
                    const trimmed = line.trim();
                    if (trimmed.startsWith("}")) currentIndent--;
                    const tabs = "\t".repeat(Math.max(currentIndent, 0));
                    const result = tabs + trimmed;
                    if (trimmed.endsWith("{")) currentIndent++;
                    return result;
                }).join("\n");
            }
            
            totalCode += indentCode(code, currentCursive);
            lastCon = con.connection ? con.connection.from : null;
        }
        return totalCode;
    }

    /**
     * @returns {string}
     */
    GenerateCode(){
        const start = this.nodes.find(n => n.internalName === this.#startingBlock);
        if (!start) return "";
        const code = this.GenerateCodeFromNode(start);
        return code;
    }

    /**
     * Gets the save-json from the workspace
     * @returns Workspace nodes (<inst>.nodes)
     */
    GetWorkspace(){
        const nodes = [];
        for(let node of this.nodes){
            const nodeJson = {
                uuid: node.uuid,
                internalName: node.internalName,
                x: node.x,
                y: node.y,
                inputs: node.inputs.map(h => ({
                    name: h.name,
                    dName: h.dName ?? h.name,
                    type: h.type,
                    value: h.value,
                    ...(h.display ? {display: h.display} : {}),
                    ...(h.integratedInput ? {integrated: h.integratedInput} : {}),
                    ...(h.values ? {values: h.values} : {}),
                    ...(h.display != "" ? {display: h.display} : {}),
                    ...(h.hideInput != false ? {hideInput: h.hideInput} : {}),
                    ...(h.inputWidth != 0 ? {inputWidth: h.inputWidth} : {}),
                    ...(h.ignoreText != false ? {ignoreText: h.ignoreText} : {}),
                    ...(h.isMutated != false ? {isMutated: h.isMutated} : {}),
                    connection: h.connection ? {
                        fromName: h.connection.fromName ?? "",
                        toName: h.connection.toName ?? "",
                        fromUUID: h.connection.from?.uuid ?? "",
                        toUUID: h.connection.to?.uuid ?? "",
                        code: null
                    } : null
                })),
                outputs: node.outputs.map(h => ({
                    name: h.name,
                    dName: h.dName ?? h.name,
                    type: h.type,
                    value: h.value,
                    ...(h.display ? {display: h.display} : {}),
                    ...(h.integratedInput ? {integrated: h.integratedInput} : {}),
                    ...(h.values ? {values: h.values} : {}),
                    ...(h.display != "" ? {display: h.display} : {}),
                    ...(h.hideInput != false ? {hideInput: h.hideInput} : {}),
                    ...(h.inputWidth != 0 ? {inputWidth: h.inputWidth} : {}),
                    ...(h.ignoreText != false ? {ignoreText: h.ignoreText} : {}),
                    ...(h.isMutated != false ? {isMutated: h.isMutated} : {}),
                    connection: h.connection ? {
                        fromName: h.connection.fromName ?? "",
                        toName: h.connection.toName ?? "",
                        fromUUID: h.connection.from?.uuid ?? "",
                        toUUID: h.connection.to?.uuid ?? "",
                        code: null
                    } : null
                }))
            };
            console.log(nodeJson.outputs);
            nodes.push(nodeJson);
        }
        return nodes;
    }

    /**
     * Sets the workspace from the given json
     * @param {Array<BNode> | string} w Workspace json (or workspace STRING)
     */
    SetWorkspace(w){
        //for IntelliSense
        /** @type {Array<BNode>} */
        let ws = [];
        if(typeof w === "string"){
            ws = JSON.parse(w);
        }else if(Array.isArray(w)){
            ws = w;
        }else{
            console.warn("no valid format! (" + typeof w + ")");
            return;
        }

        const nodeMap = {};

        const createNodeIOHandle = (h) => {
            const n = new NodeIOHandle(h.name, h.dName ?? null, h.code ?? null, h.values ?? undefined, h.display ?? "", h.type ?? "Any",
                h.integrated ?? false, h.hideInput ?? false, h.inputWidth ?? 0, h.ignoreText ?? false);
            n.isMutated = h.isMutated ?? false;
            return n;
        }

        //create nodes
        for(let node of ws){
            let inputs = [];
            let outputs = [];
            const jn = BNodes.blocks.find(n => n.internalID === node.internalName);

            for(let h of node.inputs){
                const n = createNodeIOHandle(h);
                n.value = h.value;
                inputs.push(n);
            }
            for(let h of node.outputs){
                const n = createNodeIOHandle(h);
                n.value = h.value;
                outputs.push(n);
            }
            const newNode = new BNode(jn.name, node.internalName, inputs, outputs,
                node.x, node.y, jn.color, jn.width, this, jn.mutators ?? {}, jn.alwaysGenerate, node.uuid);
            nodeMap[node.uuid] = newNode;
        }

        for(let node of ws){
            const n = this.nodes.find(n => n.uuid == node.uuid);
            const bn = BNodes.blocks.find(b => b.internalID === n.internalName);

            n.inputs.forEach((inp, i) => {
                inp.code = bn.inputs[i]?.code ?? (() => "");
            });

            n.outputs.forEach((out, i) => {
                out.code = bn.outputs[i]?.code ?? (() => "");
            });

            let i = 0;
            for(let h of node.inputs){
                if(h.connection == undefined || (i == 0 && h.name == "")){
                    i++;
                    continue;
                }
                const fromNode = this.nodes.find(n => n.uuid == h.connection.fromUUID);
                const toNode = this.nodes.find(n => n.uuid == h.connection.toUUID);

                const con = new NodeConnection(fromNode, toNode,
                    h.connection.fromName, h.connection.toName);
                n.inputs[i].connection = con;

                n.code = bn.inputs[i]?.code ?? null;
                
                i++;
            }
            i = 0;
            for(let h of node.outputs){
                if(h.connection == undefined){
                    i++;
                    continue;
                }
                const fromNode = this.nodes.find(n => n.uuid == h.connection.fromUUID);
                const toNode = this.nodes.find(n => n.uuid == h.connection.toUUID);
                if(!fromNode || !toNode){
                    i++;
                    continue;
                }

                const con = new NodeConnection(fromNode, toNode,
                    h.connection.fromName, h.connection.toName);

                n.outputs[i].connection = con;
                n.code = bn.outputs[i].code ?? null;

                i++;
            }
        }
    }

    getNodeAt(x, y){
        for(const node of this.nodes){
            const drawX = node.x - this.scrollBarX * this.scrollIntensityX;
            const drawY = node.y - this.scrollBarY * this.scrollIntensityY;

            if(x >= drawX && x <= drawX + node.width &&
                y >= drawY && y <= drawY + node.height){
                return node;
            }
        }

        return null;
    }

    ExecuteCode(){
        const code = this.GenerateCode();
        console.log("========EXEC START========");
        try{
            eval(code);
        }catch(e){
            console.error("error during code execution: " + e);
        }
        console.log("=========EXEC END=========");
    }

    /**
     * Initializes and creates all the needed things for the node editor to run
     * @param {string} startNId Start node ID (on what node your code will start on) | default: null (block: "\_\_start\_\_")
     * @param {Number} top The y-offset the canvas should have (to put your UI on)
     * @param {Number} left The x-offset the canvas should have (to put your UI on)
     * @param {Array} toolboxW The nodes in the toolbox (ALWAYS REQUIRED)
     * @param {Number} toolboxW The width of the toolbox (>= 100 for no toolbox: contextmenu instead)
     */
    constructor(startNId = null, top = 0, left = 0, right = 0, tbNodes = [], toolboxW = 0){
        const canvasTop = top;
        const canvasLeft = left;

        BNodes.toolbox = tbNodes;

        if(startNId) this.#startingBlock = startNId;
    
        const cnv = document.createElement("canvas");
        cnv.id = "main";
        const canvas = document.body.appendChild(cnv);
        const w = canvasLeft + (toolboxW > 99 ? toolboxW + 2 : 0);
        this.#tbTotalOffset = w;

        cnv.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            const mx = e.clientX - w;
            const my = e.clientY - canvasTop;
            const clickedNode = this.getNodeAt(mx, my);
            this.callCtxMenu(e, null, clickedNode);
        });

        canvas.style.position = "absolute";
        canvas.style.top = canvasTop + "px";
        canvas.style.left = w + "px";
        canvas.style.height = "calc(100% - " + canvasTop + "px)";
        canvas.style.width = "calc(100% - " + (w + right) + "px)";
        canvas.style.zIndex = "-101";

        canvas.width = window.innerWidth - (w + right);
        canvas.height = window.innerHeight - canvasTop;

        this.#canvas = canvas;
        this.#yOffset = canvasTop;
        this.#xOffset = canvasLeft
        this.#xnOffset = right;
        this.#ctx = canvas.getContext("2d");

        if(toolboxW > 99){
            const tb = document.createElement("canvas");

            tb.style.position = "absolute";
            tb.style.top = canvasTop + "px";
            tb.style.left = canvasLeft + "px";
            tb.style.height = "calc(100% - " + canvasTop + "px)";
            tb.style.width = toolboxW + "px";
            tb.style.zIndex = "-99";
            tb.style.background = getComputedStyle(document.body).backgroundColor;

            const toolbox = document.body.appendChild(tb);
            toolbox.width = toolboxW;
            toolbox.height = window.innerHeight - canvasTop;

            toolbox.addEventListener("mousedown", (e) => {
                this.toolbox.clickedFrame = true;
            });
            toolbox.addEventListener("mouseup", (e) => {
                this.toolbox.draggingScrollbarY = false;
            });

            this.toolbox.usingTB = true;
            this.toolbox.canvas = toolbox;
            this.toolbox.size.x = toolboxW;
            this.toolbox.size.y = canvasTop;
            this.toolbox.ctx = toolbox.getContext("2d");
        }

        window.addEventListener("mousemove", (e) => {
            this.toolbox.mousePos.x = e.clientX - canvasLeft;
            this.toolbox.mousePos.y = e.clientY - canvasTop;
            this.#getMousePosition(e);
        });

        window.addEventListener("mouseup", (e) => {
            this.#mouseDown = false;
            this.#dragBg = false;
            this.draggingNode = null;
            this.draggingScrollbarX = false;
            this.draggingScrollbarY = false;
            this.toolbox.draggingScrollbarY = false;
            this.toolbox.draggingNodeID = null;
            this.interacted = false;
        });

        this.#canvas.addEventListener("mousedown", (e) => {
            this.#mouseDown = true;
            if(this.#htmlctx != null){
                document.body.removeChild(this.#htmlctx);
                this.#htmlctx = null;
            }
        });

        this.#canvas.addEventListener("mouseup", (e) => {
            const node = this.toolbox.draggingNodeID;
            if(node){
                this.generateNode(node);
                this.toolbox.draggingNodeID = null;
                return;
            }
        });

        const updateCanvasSize = () => {
            canvas.width = window.innerWidth - (w + right);
            canvas.height = window.innerHeight - canvasTop;
            if (this.toolbox) {
                this.toolbox.canvas.height = window.innerHeight - canvasTop;
            }
            this.drawLoop();
        };

        window.addEventListener("resize", updateCanvasSize);

        const resizeObserver = new ResizeObserver(updateCanvasSize);
        resizeObserver.observe(document.body);

        this.drawLoop(true);
    }

    /**
     * [FOR BLOCKS] Escapes a string for code generation
     * @param {string} str String to replace with escape sequences
     * @returns {string} Escaped string
     */
    static _escapeForStr(str) {
        if (!str) return "";
        const first = str[0] === '"' ? '"' : "";
        const last = str[str.length - 1] === '"' ? '"' : "";
        const inner = str.slice(first ? 1 : 0, last ? -1 : str.length)
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t');
        return first + inner + last;
    }
}
