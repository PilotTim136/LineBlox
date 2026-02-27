const body = document.body;

class LBInstance{
    static #instance: LBInstance;
    static #instanceDiv: HTMLElement;
    static #globalMousePos: Vector2 = Vector2.zero;
    static nodeColorData: { [key: string]: string } = {
        "String": "rgb(255, 153, 0)",
        "Number": "rgb(0, 119, 255)",
        "Boolean": "rgb(0, 160, 35)",
        "Variable": "rgb(206, 0, 178)",
        "Array": "rgb(97, 0, 97)",
        "List": "rgb(97, 0, 97)",
    };

    #saveSystemInstance: LB_SaveSystem = new LB_SaveSystem();
    #toolbox: LBToolbox = new LBToolbox();
    #creatorSystem: LBCreator = new LBCreator();

    CanvasCtx_main: LB_CanvasData;
    CanvasCtx_bar: LB_CanvasData;

    ContextInstance: LB_ContextMenu;

    #canvasContainer: LB_CanvasData[] = [];
    nodes: LBNode[] = [];
    contextMenu: boolean = false;
    contextPos: Vector2 = new Vector2();

    selectedNode: LBNode | null = null;

    #frameTaskHandler: Array<{currentFrame: number, executeOn: number, func: Function}> = [];


    //#region GETTER/SETTER

    static get LBInstance(){
        let inst = LBInstance.#instance;   //dont create new instance, if instance already exists
        if(inst == null) inst = new LBInstance();
        return LBInstance.#instance;
    }
    static get getLBInstance(){
        return LBInstance.#instance;
    }
    static get LBInstanceDiv(){
        return LBInstance.#instanceDiv;
    }
    static get globalMousePos(): Vector2{ return this.#globalMousePos; }
    get saveSystem(): LB_SaveSystem{ return this.#saveSystemInstance; }
    get creator(): LBCreator{ return this.#creatorSystem; }
    get toolbox(): LBToolbox{ return this.#toolbox; }

    //#endregion

    #changeX = 400;

    constructor(pos: {x: number, y: number} = {x:0,y:0}, size: {x: number, y: number} = {x:0,y:0}){
        debug.group("LineBlox Initialization");
        let goFromDefault = false;
        if(size.x = 0 && size.y == 0) goFromDefault = true;
        if(!goFromDefault && (size.x < 200 || size.y < 200)){
            console.warn("LineBlox Init: Size-Range too small! Going from default settings.");
            goFromDefault = true;
        }
        if(goFromDefault){
            size.x = window.innerWidth - pos.x;
            size.y = window.innerHeight - pos.y;
        }

        //create the element and apply div
        debug.log("Creating LineBlox div...")
        const app = document.createElement("div");
        app.id = "LBApp";
        app.style.position = "absolute";
        app.style.left = pos.x + "px";
        app.style.top = pos.y + "px";
        app.style.width = size.x + "px";
        app.style.height = size.y + "px";
        body.appendChild(app);
        LBInstance.#instanceDiv = app;
        LBInstance.#instance = this;
        this.ContextInstance = new LB_ContextMenu();

        //create the canvases and apply them to the div
        let changeX = this.#changeX;

        debug.log("Creating main canvas...");
        let canvas = this.CreateCanvas(new Vector2(changeX - pos.x, 0), new Vector2(window.innerWidth - changeX, window.innerHeight - pos.y));
        app.appendChild(canvas.element);
        this.CanvasCtx_main = canvas;
        this.#canvasContainer.push(canvas);

        debug.log("Adding listeners...");
        window.addEventListener("click", e => { this.ContextInstance.OnClick(e); });

        this.CanvasCtx_main.element.addEventListener("wheel", (e: WheelEvent)=>{
            this.CanvasCtx_main.zoom += e.deltaY * -0.001;
            this.CanvasCtx_main.zoom = Math.min(Math.max(0.5, this.CanvasCtx_main.zoom), 10);
        }, { passive: true });

        window.addEventListener("mousemove", e => {
            LBInstance.#globalMousePos.x = e.clientX;
            LBInstance.#globalMousePos.y = e.clientY;

            this.CanvasCtx_main.UpdateMouseData(e);
            this.CanvasCtx_bar.UpdateMouseData(e);
        });
        window.addEventListener("mouseup", e => {
            this.CanvasCtx_main.OnMouseUp();
            this.CanvasCtx_bar.OnMouseUp();
        });
        window.addEventListener("keydown", e => {
            this.#onKeyPress(e);
        });

        this.CanvasCtx_main.element.addEventListener("contextmenu", (e: PointerEvent)=>{
            e.preventDefault();
            this.contextMenu = true;
            this.CanvasCtx_main.UpdateMouseData(e);

            const contextData = new LB_ContextData();

            for(const node of this.nodes){
                if(node.isMouseOver(this.CanvasCtx_main.mousePosWorld)){
                    contextData.isObject = true;
                    contextData.objectReference = node;
                    break;
                }
            }

            this.ContextInstance.Create(new Vector2(e.clientX, e.clientY), this.CanvasCtx_main, contextData);
        });

        //add scrollbar data
        this.CanvasCtx_main.sliderData[0] ??= {
            isDraggingH: false,
            isDraggingV: false,
            dragStart: new Vector2(0, 0),
            scrollStart: new Vector2(0, 0)
        };
        this.CanvasCtx_main.onScrollLogic = LB_Background.LogicScroll;

        debug.log("Creating toolbox canvas...");
        canvas = this.CreateCanvas(new Vector2(0, 0), new Vector2(changeX, window.innerHeight - pos.y));
        app.appendChild(canvas.element);
        this.#canvasContainer.push(canvas);

        this.CanvasCtx_bar = canvas;

        debug.log("Adding listeners...");
        //resize listener for when the window resizes
        //this was easier to make than i tought
        window.addEventListener("resize", ()=>{
            this.CanvasCtx_main.element.width = window.innerWidth - changeX;
            this.CanvasCtx_main.element.height = window.innerHeight;

            this.CanvasCtx_bar.element.width = changeX;
            this.CanvasCtx_bar.element.height = window.innerHeight;
        });

        this.CanvasCtx_bar.sliderData[0] ??= {
            isDraggingH: false,
            isDraggingV: false,
            dragStart: new Vector2(0, 0),
            scrollStart: new Vector2(0, 0)
        };
        this.CanvasCtx_bar.ignoreHorizontal = true;
        this.CanvasCtx_bar.onScrollLogic = LB_Background.LogicScroll;

        debug.log("Adding frametasks...");
        this.#addFrameTasks();


        debug.log("Running pre-start functions...");
        this.#updateScrollBorder();

        debug.groupEnd();

        //start update loop
        this.#onUpdate();
    }

    CreateCanvas(pos: Vector2, size: Vector2): LB_CanvasData{
        const canvas = document.createElement("canvas");
        canvas.style.position = "absolute";
        canvas.style.left = pos.x + "px";
        canvas.style.top = pos.y + "px";
        canvas.width = size.x;
        canvas.height = size.y;
        const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;

        //prevent default spacing
        canvas.style.display = "block";
        canvas.style.margin = "0";
        canvas.style.padding = "0";
        canvas.style.border = "0";

        return new LB_CanvasData(canvas, ctx);
    }

    #processingInput: boolean = false;
    #processingDraw: boolean = false;

    #onUpdate(){
        LB_Background.DrawBG(this.CanvasCtx_main, true);
        LB_Background.DrawBG(this.CanvasCtx_bar);
        this.#updateCanvasMouseData();

        //input handling
        try{
            let errorLastFrame = false;
            if(this.#processingInput){
                console.warn("Input processing failed last frame!");
                errorLastFrame = true;
            }
            this.#processingInput = true;
            this.#onNodeInput(errorLastFrame);
            this.#processingInput = false;
        }catch(e){
            console.error(e);
        }

        //drawing
        try{
            let errorLastFrame = false;
            if(this.#processingDraw){
                console.warn("Frame processing failed last frame!");
                errorLastFrame = true;
            }
            this.#processingDraw = true;
            this.#onDrawNode();
            this.#processingDraw = false;
        }catch(e){
            console.error(e);
        }

        //other
        for(const task of this.#frameTaskHandler){
            if(task.executeOn >= task.currentFrame){
                task.currentFrame = 0;
                task.func();
                continue;
            }
            task.currentFrame++;
        }

        try{
            //this.#toolbox.Draw(this.CanvasCtx_bar, this.CanvasCtx_main, this.#changeX);
            LBToolbox.Draw(this.CanvasCtx_bar, this.CanvasCtx_main, this.#changeX);
        }catch(e){
            console.error(e);
        }

        if(this.contextMenu) this.ContextInstance.Draw();

        this.CanvasCtx_main.LF_mousePosWorld = this.CanvasCtx_main.mousePosWorld;

        LB_Background.DrawScroll(this.CanvasCtx_main);
        LB_Background.DrawScroll(this.CanvasCtx_bar, true);
        requestAnimationFrame(this.#onUpdate.bind(this));
    }

    #onNodeInput(errorLastFrame: boolean = false){
        const canvas = this.CanvasCtx_main;
        for(const node of this.nodes){
            node.Input(canvas);
            if(canvas.mouseDown) node.DragNode(canvas);
            else{
                if(!errorLastFrame) node.OnDragStop(canvas.mousePosWorld);
                if(node.isDragging || node.isDraggingLine) node.generatedHitboxes = false;
                node.isDragging = false;
                node.isDraggingLine = false; 
            }
        }
    }

    #onDrawNode(){
        for(const node of this.nodes){
            node.DrawNode(this.CanvasCtx_main);
        }
    }

    //KEYBOARD
    #onKeyPress(e: KeyboardEvent){
        switch(e.key){
            case "Backspace":
            case "Delete":
                e.preventDefault();
                this.selectedNode?.Remove();
                break;
            case "Tab":
                e.preventDefault();
                const node = this.nodes[0];
                this.selectedNode = node;
                node.PushBack();
                break;
            case "Alt":
                e.preventDefault();
                break;
        }
    }

    #updateScrollBorder(){
        const canvasData = this.CanvasCtx_main;
        let maxX = 0, maxY = 0;
        for(const node of this.nodes){
            const nx = node.position.x * canvasData.zoom + node.nodeData.size.x + 100;
            const ny = node.position.y * canvasData.zoom + node.nodeData.size.y + 100;
            const calcX = canvasData.element.width - 50;
            const calcY = canvasData.element.height - 50;
            if(nx > calcX) maxX = nx - calcX > maxX ? nx - calcX : maxX;
            if(ny > calcY) maxY = ny + canvasData.element.height > maxY ? ny - calcY : maxY;
        }
        maxX += 20;
        maxY += 20;
        canvasData.maxScroll.x = maxX;
        canvasData.maxScroll.y = maxY;
    }

    #addFrameTasks(){
        this.#frameTaskHandler.push({
            currentFrame: 0,
            executeOn: 2,
            func: () => this.#updateScrollBorder()
        });
    }

    #updateCanvasMouseData(){
        for(const canvas of this.#canvasContainer){
            if(canvas.mouseDown){
                if(canvas.clickFrame !== 0){
                    canvas.mouseClicked = false;
                    canvas.mouseHold = true;
                }
                else canvas.clickFrame++;
            }else if(!canvas.mouseDown){
                canvas.clickFrame = 0;
                canvas.mouseHold = false;
                canvas.mouseClicked = false;
            }
        }
    }

    GenerateCode(){
        console.log("Generating code...");
        debug.group("CODE GEN");

        const nodes = this.nodes;

        const nodeByUuid = new Map<number, LBNode>();
        for(const n of nodes) nodeByUuid.set(n.nodeData.uuid, n);

        function findNodeByOutput(io: LB_NodeIO): LBNode | null{
            for(const n of nodes){
                for(const out of n.nodeData.outputs){
                    if(out === io) return n;
                }
            }
            return null;
        }

        const execAdj = new Map<number, Set<number>>();
        const execIncomingCount = new Map<number, number>();
        for(const n of nodes){
            execAdj.set(n.nodeData.uuid, new Set<number>());
            execIncomingCount.set(n.nodeData.uuid, 0);
        }
        for(const n of nodes){
            for(const out of n.nodeData.outputs){
                if(out.type !== "Connection") continue;
                for(const inIO of out.connections){
                    if(!inIO || !inIO.node) continue;
                    const down = inIO.node.nodeData.uuid;
                    execAdj.get(n.nodeData.uuid)!.add(down);
                    execIncomingCount.set(down, (execIncomingCount.get(down) ?? 0) + 1);
                }
            }
        }

        const seeds: number[] = [];
        for(const n of nodes){
            if(n.nodeData.alwaysGenerate > 1) seeds.push(n.nodeData.uuid);
        }

        const reachableExec = new Set<number>();
        const stack: number[] = [...seeds];
        while(stack.length){
            const u = stack.pop()!;
            if(reachableExec.has(u)) continue;
            reachableExec.add(u);
            const next = execAdj.get(u);
            if(!next) continue;
            for(const v of next)
                if(!reachableExec.has(v)) stack.push(v);
        }

        const inCount = new Map<number, number>();
        for(const id of reachableExec) inCount.set(id, 0);
        for(const id of reachableExec){
            let count = 0;
            for(const [src, dests] of execAdj){
                if(!reachableExec.has(src)) continue;
                if(dests.has(id)) count++;
            }
            inCount.set(id, count);
        }
        const noDepsQueue: number[] = [];
        for(const [id, cnt] of inCount)
            if(cnt === 0) noDepsQueue.push(id);

        const topoOrder: number[] = [];
        while(noDepsQueue.length){
            const id = noDepsQueue.shift()!;
            topoOrder.push(id);
            const dests = execAdj.get(id) ?? new Set<number>();
            for(const d of dests){
                if(!reachableExec.has(d)) continue;
                const newCnt = (inCount.get(d) ?? 0) - 1;
                inCount.set(d, newCnt);
                if(newCnt === 0) noDepsQueue.push(d);
            }
        }
        for(const id of reachableExec){
            if(!topoOrder.includes(id)){
                console.error("Cycle detected in execution graph! Node uuid:", id);
                debug.groupEnd();
                return "";
            }
        }
        debug.log("Topological execution order (uuids):", topoOrder);

        const dataCache = new Map<LB_NodeIO, string>();
        const generatedCache = new Set<number>();

        function resolveDataOutput(io: LB_NodeIO, seenIO: Set<LB_NodeIO> = new Set()): string{
            if(!io) return "";
            if(dataCache.has(io)) return dataCache.get(io)!;

            if(seenIO.has(io)){
                console.error("Data cycle detected for IO:", io.uniqueId);
                return "";
            }
            seenIO.add(io);

            const owner = findNodeByOutput(io);
            if(!owner){
                dataCache.set(io, "");
                return "";
            }

            const upstreamInputValues: Record<string, string> = {};
            for(const inp of owner.nodeData.inputs){
                if(inp.connectedTo && inp.type !== "Connection"){
                    upstreamInputValues[inp.uniqueId] = resolveDataOutput(inp.connectedTo, new Set(seenIO));
                }else{
                    upstreamInputValues[inp.uniqueId] = inp.value != null ? inp.value.toString() : "";
                }
            }

            let result = "";
            try{
                result = io.code?.({ input: upstreamInputValues, output: {} }) ?? "";
            }catch(e){
                console.error("Exception while calling data output code on", owner.nodeData.uniqueId, e);
                result = "";
            }
            result = result != null ? result.toString() : "";
            dataCache.set(io, result);
            return result;
        }

        function resolveInputsForNode(node: LBNode): Record<string, string>{
            const res: Record<string, string> = {};
            for(const input of node.nodeData.inputs) {
                if(input.connectedTo && input.type !== "Connection"){
                    res[input.uniqueId] = resolveDataOutput(input.connectedTo);
                }else{
                    res[input.uniqueId] = input.value != null ? input.value.toString() : "";
                }
            }
            return res;
        }

        function hasDataOutputConsumed(node: LBNode): boolean{
            for(const out of node.nodeData.outputs){
                if(out.type === "Connection") continue;
                if(Array.isArray(out.connections) && out.connections.length > 0) return true;
                for(const n of nodes){
                    for(const inp of n.nodeData.inputs){
                        if(inp.connectedTo === out) return true;
                    }
                }
            }
            return false;
        }

        let code = "";

        const alwaysGenNodes = nodes
            .filter(n => n.nodeData.alwaysGenerate > 1)
            .sort((a, b) => b.nodeData.alwaysGenerate - a.nodeData.alwaysGenerate);

        for (const ag of alwaysGenNodes){
            const uuid = ag.nodeData.uuid;
            if(generatedCache.has(uuid)) continue;

            const inVals = resolveInputsForNode(ag);
            let nodeCode = "";
            for(const out of ag.nodeData.outputs){
                if(out.type === "Connection" && out.code){
                    try{
                        const res = out.code({ input: inVals, output: {} });
                        nodeCode += (res != null ? res.toString() : "");
                    }catch(e){
                        console.error("Error in out.code() for exec", ag.nodeData.uniqueId, e);
                    }
                }
            }
            code += nodeCode;
            generatedCache.add(uuid);
        }

        for (const nid of topoOrder){
            const node = nodeByUuid.get(nid)!;
            if(!node) continue;

            const uuid = node.nodeData.uuid;
            if(generatedCache.has(uuid)){
                debug.log(`Skipping node ${node.nodeData.uniqueId} (${node.nodeData.uuid}) - already generated`);
                continue;
            }

            debug.log("Node:", node.nodeData.uniqueId, "uuid:", node.nodeData.uuid);
            debug.log("inputs:", node.nodeData.inputs.map(i => ({ uid: i.uniqueId, connTo: i.connectedTo?.uniqueId ?? null, value: i.value })));
            debug.log("outputs:", node.nodeData.outputs.map(o => ({ uid: o.uniqueId, type: o.type, connCount: Array.isArray(o.connections) ? o.connections.length : o.connections })));

            const hasExecOutput = node.nodeData.outputs.some(o => o.type === "Connection");
            const dataConsumed = hasDataOutputConsumed(node);
            debug.log(`hasExecutionOutput=${hasExecOutput}, dataConsumed=${dataConsumed}, alwaysGenerate=${node.nodeData.alwaysGenerate}`);

            if(!hasExecOutput && !dataConsumed && node.nodeData.alwaysGenerate <= 1){
                debug.log("-> skipping (pure data node w/o consumer)");
                generatedCache.add(uuid);
                continue;
            }

            const inVals = resolveInputsForNode(node);
            let nodeCode = "";

            for(const out of node.nodeData.outputs){
                if(out.type === "Connection" && out.code){
                    try{
                        const res = out.code({ input: inVals, output: {} });
                        nodeCode += (res != null ? res.toString() : "");
                    }catch(e){
                        console.error("Error in out.code() for exec", node.nodeData.uniqueId, e);
                    }
                }
            }

            debug.log("-> generated code fragment length:", (nodeCode || "").length);
            code += nodeCode;

            generatedCache.add(uuid);
        }

        debug.groupEnd();
        console.log("Code generated!");
        console.log("Code:\n", code);

        return code;
    }

    static GenerateUUID(): number{
        return Date.now() + Math.floor(Math.random() * 1000);
    }
    
    static LBCreateInstance(pos: {x: number, y: number} = {x:0,y:0}, size: {x: number, y: number} = {x:0,y:0}){
        if(this.#instance !== undefined){
            console.warn("Tried to create LineBlox instance while there's already one existing!");
            return;
        }
        new LBInstance(pos, size);
    }
}
