class BNode{
    #name = "";
    #intName = "";
    /** @param {Array<NodeIOHandle>} */
    #inputs;
    /** @param {Array<NodeIOHandle>} */
    #outputs;

    /** @type {number} The priority where it will automatically be generated (0 = disabled | default) */
    alwaysGenerate = 0;

    #uuid = 0;
    #stopExec = false;

    #x = 0;
    #y = 0;
    #dragOffsetX = 0;
    #dragOffsetY = 0;

    /** @type {LineBlox} */
    #inst = null;
    #na = null;
    #w = 200;
    #h = 0;

    plugin = null;
    pluginPath = null;
    pluginUuid = null;

    #mutators = {
        state: {
            inputs: {
                amount: 0,
                data: []
            },
            outputs: {
                amount: 0,
                data: []
            }
        },
        internalJson: {},
        hasInputMut: false,
        hasOutputMut: false
    };

    /** @type {string} HEX String of the color (#eb8634) */
    color;

    /** @type {Array<NodeIOHandle>} */
    get inputs(){ return this.#inputs; }
    /** @type {Array<NodeIOHandle>} */
    get outputs(){ return this.#outputs; }

    get name(){ return this.#name }
    get x(){ return this.#x }
    get y(){ return this.#y }
    get width(){ return this.#w }
    get height(){ return this.#h }
    get internalName(){ return this.#intName }
    get uuid(){ return this.#uuid }
    get mutatorState(){ return this.#mutators.state }
    get fullMutatorData(){ return this.#mutators }

    /**
     * Not recommended to set yourself!
     * @param {Number} uuid
     */
    SetUuid(uuid){
        this.#uuid = uuid;
    }
    
    /**
     * @param {Number} x
     * @param {Number} y
     */
    setPos(x, y){
        this.#x = x;
        this.#y = y;
    }

    #addMutator(type){
        type += "s";

        const state = this.#mutators.state[type];
        const nextIndex = state.amount++;

        const _newIO = this.#mutators.internalJson[type].code({ amount: nextIndex });
        const newIO = new NodeIOHandle(_newIO.name, _newIO.dName, _newIO.code, _newIO.values ?? undefined, _newIO.display,
            _newIO.type ?? "Any", _newIO.integrated ?? false, _newIO.hideInput ?? false, _newIO.inputWidth ?? false,
            _newIO.inputWidth ?? 0, _newIO.ignoreText ?? false);
        newIO.isMutated = true;
        state.data.push(newIO);

        if(type === "inputs") this.inputs.push(newIO);
        else this.outputs.push(newIO);
    }

    #getColFromType(ct){
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

    #drawConnection(x, y, toX, toY, isCon = false, conType = "na", color = ""){
        const ctx = this.#inst.ctx;

        let col = color == "" ? this.#getColFromType(conType) : color;

        ctx.strokeStyle = col;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.lineWidth = 2;
        if(this.#inst.fancyDraw.lines.enabled){
            ctx.save();
            if(this.#inst.fancyDraw.lines.glowLines){
                if(this.#inst.fancyDraw.lines.gradientGlow){
                    const grad = ctx.createLinearGradient(x, y, toX, toY);
                    grad.addColorStop(0, col);
                    grad.addColorStop(1, "white");
                    ctx.strokeStyle = grad;
                }else ctx.strokeStyle = col;

                ctx.lineWidth = 4;
                ctx.shadowColor = col;
                ctx.shadowBlur = 10;
            }
            const dx = (isCon ? 1 : -1) * Math.abs(toX - x) * 0.5;

            ctx.beginPath();
            ctx.moveTo(x, y);

            ctx.bezierCurveTo(
                x - dx, y,
                toX + dx, toY,
                toX, toY
            );
            ctx.stroke();
            ctx.restore();
        }else{
            ctx.moveTo(x, y);
            ctx.lineTo(toX, toY);
            ctx.stroke();
        }
    }

    #drawTriangle(px, py, psize){ BNode._drawTriangle(this.#inst.ctx, px, py, psize) }

    static _drawTriangle(ctx, px, py, psize){
        const size = psize / 2;
        const x = px - size;
        const y = py + size;
        ctx.strokeStyle = "white";
        ctx.beginPath();
        ctx.moveTo(x, y + size);
        ctx.lineTo(x + psize / 1.25, y);
        ctx.lineTo(x, y - size);
        ctx.lineTo(x, y + size);
        ctx.fill();
        ctx.stroke();
    }

    clone(){
        const create = (h) => {
            const n = new NodeIOHandle(h.name, h.dName, h.code, h.values, h.display, h.type, h.integratedInput, h.hideInput,
                h.inputWidth, h.ignoreText);
            n.value = h.value;
            n.isMutated = h.isMutated;
            return n;
        }

        const inp = this.#inputs.map(h => create(h));
        const out = this.#outputs.map(h => create(h));

        const node = new BNode(this.#name, this.#intName, inp, out,
            this.#x + 30, this.#y + 30, this.color, this.#w, this.#inst, undefined, this.alwaysGenerate);
        return node;
    }

    /**
     * Removes the current node
     */
    remove(){
        this.#stopExec = true;
        this.#inst.nodes = this.#inst.nodes.filter(n => n !== this);
        for(const h of this.#inputs){
            if(h._htmlInput) document.body.removeChild(h._htmlInput);
        }
        for(const h of this.#outputs){
            if(h._htmlInput) document.body.removeChild(h._htmlInput);
        }
        this.#inputs = [];
        this.#outputs = [];
        this.#uuid = null;
        this.#inst = null;
        this.#na = null;
        return;
    }

    /**
     * @param {NodeIOHandle} input
     */
    #drawHtmlInput(input, w, x, by, ax = 0, ay = 0, inputt = true, textW = 0){
        if(input?.type !== "Connect" && input?.integratedInput && input?.connection == null){
            const inputLeft = x + ax + 5 + this.#inst.tbOffset - (inputt ? 0 : 8);
            const inputTop = by - 10 + ay + this.#inst.yOffset + 0;

            let elemWidth = input.inputWidth > 0 ? input.inputWidth : w / 2;
            if(!input._htmlInput){
                let htmlElement;

                if(input.values){
                    htmlElement = document.createElement("select");

                    let i = 0;
                    for(const val of input.values){
                        const opt = document.createElement("option");
                        opt.value = val.val;
                        opt.textContent = val.dsp;
                        htmlElement.appendChild(opt);
                        if (input.value === val.val) opt.selected = true;
                        if ((!input.value || input.value === "") && i === 0) opt.selected = true;
                        i++;
                    }

                    input.value = htmlElement.value;

                    htmlElement.addEventListener("change", () => {
                        input.value = htmlElement.value;
                    });
                    htmlElement.style.width = elemWidth + 17 + "px";
                    htmlElement.style.height = "15px";
                }else{
                    htmlElement = document.createElement("input");

                    htmlElement.type = input.type === "Boolean" ? "checkbox" : input.type === "Number" ? "number" : "text";
                    if(input.type === "Boolean")
                        htmlElement.checked = input.value === true;
                    else
                        htmlElement.value = input.value != "" && input.value != null ? input.value : "";

                    htmlElement.style.width = elemWidth + "px";
                    htmlElement.style.height = "10px";

                    input.value = input.type === "Boolean" ? htmlElement.checked : htmlElement.value;

                    htmlElement.addEventListener("input", () => {
                        if(input.type === "Number") input.value = parseFloat(htmlElement.value);
                        else if(input.type === "Boolean") input.value = htmlElement.checked;
                        else input.value = htmlElement.value;
                    });
                }
                htmlElement.style.position = "absolute";
                htmlElement.style.zIndex = "-100";
                htmlElement.style.fontSize = "10px";

                document.body.appendChild(htmlElement);
                input._htmlInput = htmlElement;
            }
            if(inputt){
                input._htmlInput.style.left = inputLeft + "px";
                input._htmlInput.style.right = "auto";
            }else{
                input._htmlInput.style.left = "auto";
                input._htmlInput.style.right = this.#inst.canvas.width - (x + w - textW) + "px";
            }
            
            input._htmlInput.style.top = inputTop + 2 + "px";
            input._htmlInput.style.pointerEvents = this.#inst.dragging ? "none" : "auto";
        }else if(input._htmlInput != null){
            document.body.removeChild(input._htmlInput);
            input._htmlInput = null;
        }
    }

    #hideHtmlInputs(h_ = null){
        const removeInput = (h) => {
            if (h._htmlInput) {
                h._htmlInput.parentNode.removeChild(h._htmlInput);
                h._htmlInput = null;
            }
        };
        if(!h_){
            for(let h of this.#inputs) removeInput(h);
            for(let h of this.#outputs) removeInput(h);
        }else   removeInput(h_);
    }

    /**
     * Renders the current node
     * @param {CanvasRenderingContext2D} ctx Canvas context - for internal rendering
     */
    draw(ctx){
        if(this.#stopExec) return;

        const inst = this.#inst;
        let x = this.#x - this.#inst.scrollBarX * this.#inst.scrollIntensityX;
        let y = this.#y - this.#inst.scrollBarY * this.#inst.scrollIntensityY;
        const fontSize = 12;
        const ts = this;
        const nodeConSpace = 15;
        const w = this.#w;

        //position limits (so it doesnt go out-of-reach)
        if(this.#x < 0){
            x = 0 - this.#inst.scrollBarX;
            this.#x = x;
        }
        if(this.#y < 0){
            y = 0 - this.#inst.scrollBarY;
            this.#y = y;
        }

        const baseOffset = 30;
        let h = baseOffset;
        let offsetY = 0;
        let maxIO = Math.max(this.#inputs.length, this.#outputs.length);
        h = baseOffset + 5 + maxIO * 15;

        //if outside of bounds, remove html-inputs and stop drawing (improve as much performance as possible :D)
        if(x > this.#inst.canvas.width || x < -w || y < 0 - h || y > this.#inst.canvas.height){
            this.#hideHtmlInputs();

            //draw connections anyways (very important)
            offsetY = 0;
            for(let input of this.#inputs){
                const by = y + baseOffset + offsetY;
                if(input.connection){
                    const p = input.connection;
                    const outputIndex = p.from.outputs.findIndex(o => o.name === p.fromName);
                    let inputColor = this.#getColFromType(input.type);
                    if (outputIndex === -1){
                        console.error("Error drawing line! node disconnected.");
                        input.connection = null;
                        return;
                    }
                    if(input.connection && input.connection.from){
                        const output = input.connection.from.outputs.find(o => o.name === input.connection.fromName);
                        const outputType = output.display != "" ? output.display : !Array.isArray(output.type) ? output.type : "rgb(255, 255, 255)";
                        if(outputType) inputColor = this.#getColFromType(outputType);
                    }
                    const fromY = (p.from.y + baseOffset + outputIndex * nodeConSpace) - this.#inst.scrollBarY * this.#inst.scrollIntensityY;
                    const fromX = p.from.x + p.from.width - this.#inst.scrollBarX * this.#inst.scrollIntensityX;

                    this.#drawConnection(fromX, fromY, x, by, false, input.type, inputColor);
                }

                offsetY += nodeConSpace;
            }
            ctx.fillStyle = "white";

            //node outputs
            offsetY = 0;
            for(let output of this.#outputs){
                const by = y + baseOffset + offsetY;
                if(output.connection){
                    const p = output.connection;
                    const outputIndex = p.from.inputs.findIndex(o => o.name === p.fromName);
                    if (outputIndex === -1){
                        console.error("Error drawing line! node disconnected. [not found: " + this.#name + "]");
                        output.connection = null;
                        return;
                    }
                    const fromY = (p.from.y + baseOffset + outputIndex * nodeConSpace) - this.#inst.scrollBarY * this.#inst.scrollIntensityY;
                    const fromX = p.from.x - this.#inst.scrollBarX * this.#inst.scrollIntensityX;

                    this.#drawConnection(fromX, fromY, x + w, by, true,
                        this.#getColFromType(output.display != "" ? output.display : !Array.isArray(output.type) ? output.type : "rgb(255, 255, 255)"));
                }
                offsetY += nodeConSpace;
            }

            return;
        }

        //bg for node
        const rounding = 5;

        ctx.fillStyle = this.color;
        if(this.#inst.fancyDraw.nodes){
            if(this.#inst.fancyDraw.nodeHead.gradients){
                const grad = ctx.createRadialGradient(x, y, w, x, y, 5);
                grad.addColorStop(1, this.color);
                grad.addColorStop(0, ColUtil.darkenColor(this.color, this.#inst.fancyDraw.nodeHead.darkerAmount ?? 40));
                ctx.fillStyle = grad;
            }
            ctx.beginPath();
            ctx.roundRect(x, y, w, 20, [rounding, rounding, 0, 0]);
            ctx.fill();

            ctx.beginPath();
            //ctx.fillStyle = this.color;
            ctx.globalAlpha = 0.5;
            ctx.roundRect(x, y + 20, w, h - 20, [0, 0, rounding, rounding]);
            ctx.fill();
            ctx.globalAlpha = 1;
        }else ctx.fillRect(x, y, w, h);
        ctx.fillStyle = "white";

        //node name
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = "white";
        ctx.font = "15px Sans-Serif";
        ctx.fillText(this.#name, x + w / 2, y + 5, w);

        const r = 5;    //radius
        let by_ = y + baseOffset + offsetY;
        let nx_ = 0;
        //node inputs
        offsetY = 0;
        ctx.textBaseline = "middle";
        for(let input of this.#inputs){
            const by = y + baseOffset + offsetY;

            ctx.fillStyle = "white";
            ctx.font = fontSize + "px Sans-Serif";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            const text = input.dName;
            ctx.fillText(text, x + 10, by, w / 2);

            const defCol = "rgb(255, 255, 255)";
            let inputColor = this.#getColFromType(input.display ? input.display : !Array.isArray(input.type) ? input.type : defCol);
            if(input.connection && input.connection.from){
                const output = input.connection.from.outputs.find(o => o.name === input.connection.fromName);
                const outputType = output ? output.display != "" ? output.display : !Array.isArray(output.type) ? output.type : defCol : defCol;
                if(outputType) inputColor = this.#getColFromType(outputType);
            }

            const textW = ctx.measureText(text).width;
            const tx = x + 5 + (input.ignoreText ? 0 : textW);
            this.#drawHtmlInput(input, w / 2, tx, by);
            if(input.isMutated){
                const a = 2;    //additional
                const bs = fontSize+a;
                const __x = tx + textW*2;

                const mouse = {
                    x: inst.mouseX,
                    y: inst.mouseY
                }
                const mr = {
                    x: __x - 28,
                    y: by - (5+a),
                    w: bs,
                    h: bs
                };
                ctx.strokeStyle = "white";
                ctx.beginPath();
                ctx.roundRect(mr.x, mr.y, mr.w, mr.h, 2);
                ctx.fill();
                ctx.stroke();
                
                ctx.fillStyle = "black";
                ctx.textBaseline = "top";
                ctx.textAlign = "left";
                ctx.fillText("--", __x - 25, by - 5, bs);
                ctx.fillStyle = "white";
                ctx.textBaseline = "middle";

                if(inst.IsMouseAvailable() && mouse.x >= mr.x && mouse.x <= mr.x + mr.w &&
                    mouse.y >= mr.y && mouse.y <= mr.y + mr.h){
                    inst.interacted = true;
                    this.#hideHtmlInputs(input);
                    this.#inputs = this.#inputs.filter(i => i !== input);
                }
            }

            if(input.hideInput ?? false){
                if(input.integratedInput){
                    offsetY += nodeConSpace;
                    by_ = by;
                }
                continue;
            }
            if (!inst.mouseDown && inst.prevDraggingNodePoint) {
                const additional = 1;
                const dx = inst.mouseX - x;
                const dy = inst.mouseY - by;
                //check for mouse
                if(dx * dx + dy * dy <= (r+additional) * (r+additional)){
                    const p = inst.prevDraggingNodePoint;
                    if(p.node != this){
                        let canConnect = true;
                        if(input.type !== "Any"){
                            const inputTypes = Array.isArray(input.type) ? input.type : [input.type];
                            const outputTypes = Array.isArray(p.output.type) ? p.output.type : [p.output.type];

                            const hasMatch = inputTypes.includes("Any") ||
                                outputTypes.includes("Any") ||
                                inputTypes.some(it => outputTypes.includes(it));

                            if(!hasMatch){
                                canConnect = false;
                            }
                        }
                        if(input.type === "Any" && p.output.type === "Connect") canConnect = false;
                        
                        //if types correct, connect
                        if(canConnect){
                            let canCon = true;
                            let removed = false;

                            if(input.connection){
                                const oldCon = input.connection;

                                const isSameConnection = oldCon.from === p.node &&
                                    oldCon.to === this &&
                                    oldCon.fromName === p.output.name &&
                                    oldCon.toName === input.name;

                                if(isSameConnection){
                                    input.connection = null;
                                    if(oldCon.from){
                                        const out = oldCon.from.outputs.find(o => o.connection === oldCon);
                                        if(out) out.connection = null;
                                    }
                                    removed = true;
                                }else{
                                    input.connection = null;
                                    if(oldCon.from){
                                        const out = oldCon.from.outputs.find(o => o.connection === oldCon);
                                        if(out) out.connection = null;
                                    }
                                }
                            }

                            if(!removed && p.output.connection){
                                const oldCon = p.output.connection;

                                const isSameConnection = oldCon.from === p.node &&
                                    oldCon.to === this &&
                                    oldCon.fromName === p.output.name &&
                                    oldCon.toName === input.name;

                                if(isSameConnection){
                                    p.output.connection = null;
                                    if(oldCon.to){
                                        const inp = oldCon.to.inputs.find(i => i.connection === oldCon);
                                        if(inp) inp.connection = null;
                                    }
                                    removed = true;
                                }else{
                                    p.output.connection = null;
                                    if(oldCon.to){
                                        const inp = oldCon.to.inputs.find(i => i.connection === oldCon);
                                        if(inp) inp.connection = null;
                                    }
                                }
                            }

                            //connect does another type of connection (other -> current), which makes parsing from order easier
                            //while everything else will be (current -> other), which makes back-tracking for values & intergrated input easier
                            if(!removed){
                                const inputTypes = Array.isArray(input.type) ? input.type : [input.type];
                                const outputTypes = Array.isArray(p.output.type) ? p.output.type : [p.output.type];

                                if(input.type === "Connect"){
                                    input.connection = null;
                                    p.output.connection = null;
                                    const c = new NodeConnection(this, p.node, input.name, p.output.name);
                                    p.output.connection = c;
                                }else{
                                    const hasMatch = input.type === "Any" || 
                                        outputTypes.some(ot => inputTypes.includes(ot));

                                    const invalidAnyConnect = (input.type === "Any" && outputTypes.includes("Connect")) ||
                                        (outputTypes.includes("Any") && input.type === "Connect");

                                    if(hasMatch && !invalidAnyConnect){
                                        input.connection = null;
                                        p.output.connection = null;
                                        const c = new NodeConnection(p.node, this, p.output.name, input.name);
                                        input.connection = c;
                                    }else{
                                        console.warn(`Can't connect nodes: Type mismatch (trying to connect (${p.output.type}) with (${input.type}))`);
                                        canCon = false;
                                    }
                                }
                            }
                            if(canCon) inst.connected = true;
                        }else console.warn(`Can't connect nodes: Type mismatch (trying to connect (${p.output.type}) with (${input.type}))`);
                    }else console.error("Can't connect node to current.");
                }
            }

            if(input.connection){
                const p = input.connection;
                const outputIndex = p.from.outputs.findIndex(o => o.name === p.fromName);
                if (outputIndex === -1){
                    console.error("Error drawing line! node disconnected.");
                    input.connection = null;
                    return;
                }
                const fromY = (p.from.y + baseOffset + outputIndex * nodeConSpace) - this.#inst.scrollBarY * this.#inst.scrollIntensityY;
                const fromX = p.from.x + p.from.width - this.#inst.scrollBarX * this.#inst.scrollIntensityX;

                this.#drawConnection(fromX, fromY, x, by, false, input.type, inputColor);
            }

            if(input.type == "Connect") this.#drawTriangle(x + 1, by - 5.5, 11);
            else{
                ctx.fillStyle = inputColor;
                ctx.beginPath();
                ctx.arc(x, by, r, 0, 2 * Math.PI);
                ctx.fill();
            }

            offsetY += nodeConSpace;
            by_ = by;
        }
        if(this.#mutators.hasInputMut){
            const rectX = x + 10;
            const rectY = by_ + nodeConSpace - 5;
            const rectW = w / 2 - 5;
            const rectH = nodeConSpace;

            const mx = inst.mouseX;
            const my = inst.mouseY;

            const w_ = 2;
            ctx.lineWidth = w_;
            ctx.font = fontSize + "px Sans-Serif";
            ctx.textAlign = "center";
            ctx.fillStyle = ColUtil.darkenColor(this.color, 20);
            ctx.beginPath();
            ctx.roundRect(rectX, rectY, rectW, rectH, 5);
            ctx.fill();
            ctx.stroke();

            ctx.strokeStyle = this.color;
            ctx.roundRect(rectX - w_/2, rectY - w_/2, rectW + w_/2, rectH + w_/2, 5+w_);
            ctx.stroke();
            ctx.lineWidth = 1;

            ctx.fillStyle = "white";
            ctx.fillText("Add " +
                (this.#mutators.internalJson.inputs.addType == undefined ? "Mutation" : this.#mutators.internalJson.inputs.addType),
                rectX + rectW/2, rectY + rectH/2, rectW);

            if(inst.IsMouseAvailable() && (mx >= rectX &&
                mx <= rectX + rectW &&
                my >= rectY &&
                my <= rectY + rectH)){
                this.#addMutator("input");
                inst.interacted = true;
            }
        }
        ctx.fillStyle = "white";

        //node outputs
        offsetY = 0;
        nx_ = 0;
        for(let output of this.#outputs){
            if(output.hideInput) continue;
            const nx = x + w - 10;
            const by = y + baseOffset + offsetY;


            let inputColor = this.#getColFromType(output.display != "" ? output.display : !Array.isArray(output.type) ? output.type : "rgb(255, 255, 255)");
            if(output.connection){
                const p = output.connection;
                const outputIndex = p.from.inputs.findIndex(o => o.name === p.fromName);
                if (outputIndex === -1){
                    console.error("Error drawing line! node disconnected. [not found: " + this.#name + "]");
                    output.connection = null;
                    return;
                }
                const fromY = (p.from.y + baseOffset + outputIndex * nodeConSpace) - this.#inst.scrollBarY * this.#inst.scrollIntensityY;
                const fromX = p.from.x - this.#inst.scrollBarX * this.#inst.scrollIntensityX;

                this.#drawConnection(fromX, fromY, x + w, by, true, inputColor);
            }

            if(output?.type == "Connect") this.#drawTriangle(nx + 11, by - 5.5, 11);
            else{
                ctx.fillStyle = inputColor;
                ctx.beginPath();
                ctx.arc(nx + 10, by, r, 0, 2 * Math.PI);
                ctx.fill();
            }

            ctx.fillStyle = "white";
            ctx.font = fontSize + "px Sans-Serif";
            ctx.textAlign = "right";
            ctx.textBaseline = "middle";
            const text = output.dName;
            ctx.fillText(text, nx, by, w / 2);

            const textW = ctx.measureText(text).width;
            this.#drawHtmlInput(output, w, x - (10 + output.ignoreText ? 7 : textW),
                by, 0, 0, false, output.ignoreText ? 0 : 5 + textW);

            if(inst.IsMouseAvailable()){
                const dx = inst.mouseX - (nx + 10);
                const dy = inst.mouseY - by;
                if(dx * dx + dy * dy <= r * r){
                    inst.draggingNodePoint = {
                        node: this,
                        output: output
                    };
                    inst.connected = false;
                    inst.interacted = true;
                }
            }
            if(inst.draggingNodePoint && inst.draggingNodePoint.output === output){
                if(inst.draggingNodePoint.node == this){
                    const index = this.#na.indexOf(this);
                    this.#na.splice(index, 1);
                    this.#na.push(this);
                    this.#drawConnection(nx + 10, by, inst.mouseX, inst.mouseY);
                }
            }
            //ToDo (sometime):
            //somehow figure out how to connect it to the new selected node from the dropdown
            //note: it works for the first output (0), but not for any others (for some reason)
            /*else if(!inst.mouseDown && inst.prevDraggingNodePoint != null && !inst.connected &&
                output.type === "Connect"){
                inst.callCtxMenu(null, inst.prevDraggingNodePoint);
            }*/
            offsetY += nodeConSpace;
            by_ = by;
            nx_ = nx;
        }

        this.#h = h;
        
        //move node if needed
        let mx = inst.mouseX;
        let my = inst.mouseY;
        if(inst.IsMouseAvailable()){
            if(mx < x - 10 + w && mx > x + 10 &&
                my < y + h && my > y){
                    inst.draggingNode = this;
                    this.#dragOffsetX = mx - this.#x;
                    this.#dragOffsetY = my - this.#y;
                    const index = this.#na.indexOf(this);
                    this.#na.splice(index, 1);
                    this.#na.push(this);
                    inst.interacted = true;
                }
        }
        if(inst.draggingNode == this){
            ts.setPos(mx - ts.#dragOffsetX, my - ts.#dragOffsetY);
            return;
        }
    }

    /**
     * This will initialize the node.
     * @param {Array<NodeIOHandle>} inputs Inputs the object will have
     * @param {Array<NodeIOHandle>} outputs Outputs the object will have
     * @param {string} col String of the color (#eb8634)
     * @param {Number} x
     * @param {Number} y
     * @param {Number} width
     * @param {LineBlox} instance Where to store & read the current node
     * @param {Number | undefined} uuid Recommended to leave undefined!
     * @param {Boolean} isClone Recommended to leave false!
     * @param {string | null} pluginUUID To what plugin this node belongs to
     */
    constructor(name, intName, inputs, outputs, x = 0, y = 0, col = "#eb8634", width = 200,
        instance = LBInst, mutatorJSON = {}, alwaysGen = 0, uuid = undefined, isClone = false, pluginUUID = null){

        if(!Array.isArray(inputs) || !Array.isArray(outputs)) throw new Error("Inputs or Outputs is not an array! Stopping node creation.");
        if(!inputs.every(i => i instanceof NodeIOHandle)) throw new TypeError("All inputs must be NodeIOHandle");
        if(!outputs.every(i => i instanceof NodeIOHandle)) throw new TypeError("All outputs must be NodeIOHandle");

        this.#name = name;
        this.#intName = intName;
        this.#inputs = inputs;
        this.#outputs = outputs;
        this.#x = x;
        this.#y = y;
        this.color = col;
        this.#inst = instance;
        this.#na = instance.nodes;
        this.#w = width;
        this.pluginUuid = pluginUUID;

        this.#mutators.internalJson = mutatorJSON;
        if(mutatorJSON.inputs) this.#mutators.hasInputMut = true;
        if(mutatorJSON.outputs) this.#mutators.hasOutputMut = true;
        for(let input of inputs){
            if(input.isMutated){
                this.#mutators.state.inputs.data.push(input);
            }
        }

        this.alwaysGenerate = alwaysGen ?? 0;
        if(uuid) this.#uuid = uuid;
        else this.#uuid = Date.now() + Math.random();
        if(isClone){
            for(const h of this.#inputs){
                if(h.connection) h.connection = null;
            }
            for(const h of this.#outputs){
                if(h.connection) h.connection = null;
            }
        }

        this.#na.push(this);
    }
}
