class LBNode{
    position: Vector2;
    nodeData: LB_NodeData;
    color: Color;
    alwaysDraw: boolean = false;

    isDragging: boolean = false;
    isDraggingLine: boolean = false;
    dragOffset: Vector2 = new Vector2();
    lineDragStart: Vector2 = new Vector2();
    generatedHitboxes: boolean = false;

    dragFromHitbox: { x: number; y: number; w: number; h: number; id: string; isInput: boolean; node: LBNode, io: LB_NodeIO } | null = null;

    #darkerRgba: string;

    //this value is just, because i want to use the same script for simplicity for rendering
    #willBeUsed;

    constructor(pos: Vector2, data: LB_NodeData, willBeUsed = true){
        this.position = pos;
        this.color = data.color;

        for(const io of data.inputs) io.node = this;
        for(const io of data.outputs) io.node = this;
        
        this.#darkerRgba = data.color.clone().darken(50).toRgbaString();

        this.#willBeUsed = willBeUsed;
        
        data.RegenerateHeight();
        this.nodeData = data;
    }

    //called every frame (like DrawNode)
    Input(canvas: LB_CanvasData){
        if(!this.#willBeUsed) return;
        const inst = LBInstance.LBInstance;
        if(this.IsInNode(canvas.mousePosWorld) && canvas.mouseClicked && inst.selectedNode !== this){
            inst.selectedNode = this;
        }


        const thisNode: LBNode = this;

        //this took WAYYY too long
        function CheckNodes(input: LB_NodeIO[]){
            for(const io of input){
                if(!io.node) continue;
                let foundNode: boolean = false;
                for(const node of inst.nodes){
                    if(node === thisNode || !io.connectedTo?.node) continue;
                    foundNode = io.connectedTo.node.nodeData.uuid === node.nodeData.uuid;
                    if(foundNode) break;
                }
                if(!foundNode){
                    io.connectedTo = null;
                    io.connectedToId = 0;
                }
            }
        }

        CheckNodes(this.nodeData.inputs);
        //CheckNodes(this.nodeData.outputs);
    }

    DrawNode(canvas: LB_CanvasData, ignoreBoundsX = false){
        const ctx = canvas.context;
        const zoom = canvas.zoom;

        const nodePos = this.position;
        const nodeColor = this.color;
        const nodeData = this.nodeData;
        const nodeSize = nodeData.size;

        if(!ignoreBoundsX) if(nodePos.x < 0) nodePos.x = 0;
        if(nodePos.y < 0) nodePos.y = 0;
        
        const isInView = this.#isInView(canvas, nodePos, nodeSize);
        if(!isInView) return;

        const rgbastr = nodeColor.toRgbaString();
        ctx.fillStyle = rgbastr;
        if(LB_NodeSettings.drawSimple) ctx.fillRect(nodePos.x, nodePos.y, nodeSize.x, nodeSize.y);
        else{
            let fill: CanvasGradient | string;
            if(zoom > 0.6 || !this.#willBeUsed){
                fill = ctx.createLinearGradient(nodePos.x, nodePos.y, nodePos.x, nodePos.y + 14);
                fill.addColorStop(0, rgbastr);
                fill.addColorStop(1, this.#darkerRgba);
            }else fill = rgbastr;

            ctx.fillStyle = fill;
            ctx.beginPath();
            ctx.roundRect(nodePos.x, nodePos.y, nodeSize.x, 14, [5, 5, 0, 0]);
            ctx.closePath();
            ctx.fill();

            const col = nodeColor.clone();
            col.a = 0.4;
            ctx.fillStyle = col.toRgbaString();
            ctx.beginPath();
            ctx.roundRect(nodePos.x, nodePos.y + 14, nodeSize.x, nodeSize.y - 14, [0, 0, 5, 5]);
            ctx.closePath();
            ctx.fill();

            if(LBInstance.LBInstance.selectedNode === this){
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#ffffff";
                ctx.beginPath();
                ctx.roundRect(nodePos.x, nodePos.y, nodeSize.x, nodeSize.y, [5, 5, 5, 5]);
                ctx.closePath();
                ctx.stroke();
            }
        }

        ctx.lineWidth = 2;
        this.#drawNodeName(ctx, nodePos, nodeSize, nodeData);
        this.#drawIO(ctx, nodePos, nodeSize, nodeData);
    }

    #drawInput(ctx: CanvasRenderingContext2D, drawPos: {x:number,y:number}, io: LB_NodeIO){
        const col = LBInstance.nodeColorData[io.type];
        let fill = ctx.createLinearGradient(drawPos.x, drawPos.y, drawPos.x + io.boxWidth, drawPos.y);
        fill.addColorStop(0, col);
        fill.addColorStop(1, Color.darken(20, col).toRgbaString());
        ctx.strokeStyle = fill;
        
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";

        const lineBefore = ctx.lineWidth;
        ctx.beginPath();
        ctx.roundRect(drawPos.x, drawPos.y, io.boxWidth, 14, [5, 5, 5, 5]);
        ctx.closePath();
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();

        ctx.lineWidth = lineBefore;
    }

    #drawIO(ctx: CanvasRenderingContext2D, nodePos: Vector2, nodeSize: Vector2, nodeData: LB_NodeData){
        const inputs = nodeData.inputs;
        const outputs = nodeData.outputs;
        const height = nodeData.ioHeight;
        const baseY = nodePos.y + 25;

        const r = 5;
        const calcR = r + 3;

        if(nodeData.dynamicHeight) this.generatedHitboxes = false || !this.#willBeUsed;
        if(!this.generatedHitboxes) nodeData.ioHitboxes = [];   //only reset hitboxes, if "generatedHitboxes" is false, which happens when "dynamicHeight" is true
        const hitSize = 10;                                     //this is for the hitbox size - hitbox data will be saved here
        const hitSizeHalf = hitSize / 2;                        //for less runtime math (saves a little of CPU)
        const hitboxY = 3 + hitSizeHalf;                        //for less temporary stuff

        ctx.textAlign = "left";
        for(let i = 0; i < inputs.length; i++){
            const data: LB_NodeIO = inputs[i];
            const y = baseY + (i * height);

            ctx.fillStyle = "#ffffff";
            ctx.fillText(data.name, nodePos.x + calcR, y, nodeSize.x / 2 - calcR);

            if(data.integrated) this.#drawInput(ctx, {x: nodePos.x + calcR + ctx.measureText(data.name).width, y: y - 8}, data);
            if(data.hidden) continue;
            ctx.fillStyle = LBInstance.nodeColorData[data.type] ?? "#ffffff";
            if(data.type != "Connection") LBNode.DrawCircle(ctx, nodePos.x, y - 3.5, r);
            else LBNode.DrawTriangle(ctx, nodePos.x - 4, y - 3.5, r * 2);

            if(!this.#willBeUsed) continue;
            if(data.connectedTo != null && data.connectedTo.node != null){
                const start = new Vector2(nodePos.x, y - hitboxY + 5);

                const targetNode = data.connectedTo.node;
                const ioIndex = targetNode.nodeData.outputs.indexOf(data.connectedTo);
                const targetY = targetNode.position.y + 19.5 + ioIndex * height;

                const end = new Vector2(targetNode.position.x + targetNode.nodeData.size.x, targetY);

                LBNode.DrawLine(ctx, start, end);
            }

            if(this.generatedHitboxes) continue;
            nodeData.ioHitboxes.push({
                x: nodePos.x - hitSizeHalf,
                y: y - hitboxY,
                w: hitSize,
                h: hitSize,
                id: data.uniqueId,
                node: this,
                isInput: true,
                io: data
            });
        }

        ctx.textAlign = "right";
        for(let i = 0; i < outputs.length; i++){
            const data: LB_NodeIO = outputs[i];
            const y = baseY + (i * height);

            ctx.fillStyle = "#ffffff";
            ctx.fillText(data.name, nodePos.x + nodeSize.x - calcR, y, nodeSize.x / 2 - calcR);

            if(data.hidden) continue;
            ctx.fillStyle = LBInstance.nodeColorData[data.type] ?? "#ffffff";
            if(data.type != "Connection") LBNode.DrawCircle(ctx, nodePos.x + nodeSize.x, y - 3.5, r);
            else LBNode.DrawTriangle(ctx, nodePos.x + nodeSize.x - 4, y - 3.5, r * 2);

            if(!this.#willBeUsed) continue;
            if(this.generatedHitboxes) continue;
            nodeData.ioHitboxes.push({
                x: nodePos.x + nodeSize.x - hitSizeHalf,
                y: y - hitboxY,
                w: hitSize,
                h: hitSize,
                id: data.uniqueId,
                node: this,
                isInput: false,
                io: data
            });
        }

        this.generatedHitboxes = true;
    }

    #drawNodeName(ctx: CanvasRenderingContext2D, nodePos: Vector2, nodeSize: Vector2, nodeData: LB_NodeData){
        ctx.strokeStyle = "#ffffff";
        ctx.font = "12px Sans-Serif";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText(nodeData.publicName, nodePos.x + nodeSize.x / 2, nodePos.y + 12, nodeSize.x);
    }

    Remove(){
        const inst = LBInstance.LBInstance;
        const index = inst.nodes.indexOf(this);
        if (index !== -1) inst.nodes.splice(index, 1);
    }

    /**
     * Call this BEFORE resetting things like `[node].isDraggingLine`!
     */
    OnDragStop(mouseWorld: Vector2){
        this.#connectLine(mouseWorld);
    }

    DragNode(canvas: LB_CanvasData, override = false){
        if(!this.#willBeUsed && !override) return;
        if(!canvas.canDrag && !this.isDragging) return;
        const mouseWorld = canvas.mousePosWorld;

        this.#checkDragLine(canvas, mouseWorld);
        if(this.isDraggingLine) return;
        this.#checkDragNode(canvas, mouseWorld);
    }

    #checkDragLine(canvas: LB_CanvasData, mouseWorld: Vector2){
        const hitboxes = this.nodeData.ioHitboxes;
        const ctx = canvas.context;

        if(canvas.mouseClicked){
            for(const hb of hitboxes){
                if(LBNode.IsPointInHitbox(hb, mouseWorld)){
                    this.isDraggingLine = true;
                    this.lineDragStart = new Vector2(hb.x + hb.w / 2, hb.y + hb.h / 2);
                    this.dragFromHitbox = hb;
                    return;
                }
            }
        }
        if(this.isDraggingLine) LBNode.DrawLine(ctx, this.lineDragStart, mouseWorld);
    }

    #checkDragNode(canvas: LB_CanvasData, mouseWorld: Vector2){
        if(this.isDraggingLine) return;
        const inNode = this.IsInNode(mouseWorld);
        
        if(this.isDragging){
            this.position = mouseWorld.add(this.dragOffset);
        }
        else{
            if(!inNode || !canvas.mouseClicked) return;
            canvas.canDrag = false;
            this.isDragging = true;
            this.dragOffset = this.position.subtract(mouseWorld);
            this.PushBack();
        }
    }

    #isInView(canvas: LB_CanvasData, nodePos: Vector2, nodeSize: Vector2): boolean{
        if(this.alwaysDraw) return true;
        const viewX = canvas.scrollPos.x;
        const viewY = canvas.scrollPos.y;
        const viewW = canvas.element.width / canvas.zoom;
        const viewH = canvas.element.height / canvas.zoom;

        return nodePos.x + nodeSize.x > viewX &&
            nodePos.x < viewX + viewW &&
            nodePos.y + nodeSize.y > viewY &&
            nodePos.y < viewY + viewH;
    }

    /** Checks if given position is inside of the Node */
    IsInNode(pos: Vector2){
        const inNodeX = pos.x >= this.position.x && pos.x <= this.position.x + this.nodeData.size.x;
        const inNodeY = pos.y >= this.position.y && pos.y <= this.position.y + this.nodeData.size.y;
        return inNodeX && inNodeY;
    }

    PushBack(){
        const inst = LBInstance.LBInstance;
        const index = inst.nodes.indexOf(this);
        if (index !== -1) inst.nodes.splice(index, 1);
        inst.nodes.push(this);
    }

    Clone(resetWillBeUsed = false): LBNode{
        const ndClone = this.nodeData.Clone();
        const n = new LBNode(this.position, ndClone, this.#willBeUsed);
        if(resetWillBeUsed) n.#willBeUsed = true;
        n.nodeData.ResetUuids();
        return n;
        /*const json = this.toJson();
        return LBNode.fromJson(json);*/
    }

    #connectLine(mouseWorld: Vector2){
        if(!this.isDraggingLine || !this.dragFromHitbox) return;
        const nodes = LBInstance.LBInstance.nodes;
        const thisHitbox = this.dragFromHitbox;
        for(const node of nodes){
            const hitboxes = node.nodeData.ioHitboxes;
            if(node === this) continue;

            //i would lie, if i would say i would have expected it to work
            for(const hb of hitboxes){
                if(!LBNode.IsPointInHitbox(hb, mouseWorld)) continue;
                const hbIo: LB_NodeIO = hb.io;

                const inputIO: LB_NodeIO = thisHitbox.isInput ? thisHitbox.io : hbIo;
                const outputIO: LB_NodeIO = hb.isInput ? thisHitbox.io : hbIo;

                LBNode.ConnectNodes(inputIO, outputIO);
            }
        }
    }

    static ConnectNodes(inputIO: LB_NodeIO, outputIO: LB_NodeIO){
        if(outputIO.type === "Connection") outputIO.allowMultiple = false;

        if(inputIO.connectedTo === outputIO){
            inputIO.connectedTo = null;
            inputIO.connectedToId = 0;

            if(outputIO.type === "Connection"){
                outputIO.connections = outputIO.connections.filter(i => i !== inputIO);
            }
            return;
        }
        
        if(outputIO.type === "Connection"){
            inputIO.connectedTo = outputIO;
            outputIO.connections.push(inputIO);
            return;
        }

        if(inputIO.type.toLowerCase() !== "any" && inputIO.type !== outputIO.type) return;

        if(inputIO.connectedTo){
            const oldOutput = inputIO.connectedTo;
            oldOutput.connections = oldOutput.connections.filter(i => i !== inputIO);
        }

        if(!outputIO.allowMultiple){
            for(const oldInput of outputIO.connections){
                oldInput.connectedTo = null;
                oldInput.connectedToId = 0;
            }

            outputIO.connections = [];
        }

        inputIO.connectedTo = outputIO;
        inputIO.connectedToId = outputIO.uuid;

        outputIO.connections.push(inputIO);
    }

    static DrawTriangle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number){
        ctx.beginPath();
        ctx.moveTo(x, y - size / 2);
        ctx.lineTo(x + size, y);
        ctx.lineTo(x, y + size / 2);
        ctx.closePath();
        ctx.fill();
    }

    static DrawCircle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number){
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    static IsPointInHitbox(hb: any, pos: Vector2): boolean{
        return (
            pos.x >= hb.x &&
            pos.x <= hb.x + hb.w &&
            pos.y >= hb.y &&
            pos.y <= hb.y + hb.h
        );
    }

    static DrawLine(ctx: CanvasRenderingContext2D, start: Vector2, end: Vector2){
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    }

    isMouseOver(mouseWorld: Vector2): boolean {
        const size = this.nodeData.size;
        return  mouseWorld.x >= this.position.x &&
                mouseWorld.x <= this.position.x + size.x &&
                mouseWorld.y >= this.position.y &&
                mouseWorld.y <= this.position.y + size.y;
    }

    toJson(): object{
        return {
            position: this.position.toJson(),
            nodeData: this.nodeData.toJson(),
            //this is just debug data that will appear when you click "ctxmenu -> Log" on a node
            ...(DEBUG ? {
                willBeUsed: this.#willBeUsed,
                alwaysGenPriority: this.nodeData.alwaysGenerate,
                nodeUid: this.nodeData.uniqueId
            } : {})
        };
    }
    static fromJson(json: any/*, creator: LBCreator*/): LBNode{
        //console.log(json);
        //const base = creator.GetNodeById(json.nodeData.uniqueId);
        const base = LBCreator.GetNodeById(json.nodeData.uniqueId);
        if(!base){
            throw new Error("Unknown node type: " + json.nodeData.uniqueId);
        }

        const nodeData = base.Clone();
        nodeData.fromJson(json.nodeData);

        return new LBNode(Vector2.fromJson(json.position), nodeData);
    }
    static SpawnNode(spawnInWorkspace: boolean = true, node: string, pos: Vector2 = Vector2.zero): LBNode | undefined{
        const inst = LBInstance.LBInstance;
        //const creator = inst.creator;
        //const toCreate = creator.GetNodeById(node);
        const toCreate = LBCreator.GetNodeById(node);
        if(toCreate === undefined){
            console.warn("Can't create node with uId [", node, "], because ID does not exist.");
            return;
        }
        const nd = toCreate.Clone();
        const n = new LBNode(pos, nd, true);
        if(spawnInWorkspace) inst.nodes.push(n);
        return n;
    }
}
