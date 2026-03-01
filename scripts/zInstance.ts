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

    //todo: correctly fix the resize when window is resized
    //note: done in the resize event listener
    constructor(pos: {x: number, y: number} = {x:0,y:0}, size: {x: number, y: number} = {x:0,y:0}){
        debug.group("LineBlox Initialization");
        let goFromDefault = false;
        if(size.x = 0 && size.y == 0) goFromDefault = true;
        if(!goFromDefault && (size.x < 200 || size.y < 200)){
            debug.warn("LineBlox Init: Size-Range too small! Going from default settings.");
            goFromDefault = true;
        }
        if(goFromDefault){
            size.x = window.innerWidth - pos.x;
            size.y = window.innerHeight - pos.y;
        }

        //create the element and apply div
        debug.log("Creating LineBlox div...");
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

        //#region canvases & listeners

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
            this.CanvasCtx_main.element.width = window.innerWidth - changeX - pos.x;
            this.CanvasCtx_main.element.height = window.innerHeight - pos.y;

            this.CanvasCtx_bar.element.width = changeX;
            this.CanvasCtx_bar.element.height = window.innerHeight - pos.y;
        });

        this.CanvasCtx_bar.sliderData[0] ??= {
            isDraggingH: false,
            isDraggingV: false,
            dragStart: new Vector2(0, 0),
            scrollStart: new Vector2(0, 0)
        };
        this.CanvasCtx_bar.ignoreHorizontal = true;
        this.CanvasCtx_bar.onScrollLogic = LB_Background.LogicScroll;

        //#endregion

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
        //this is important. looks are important, alright?
        for(const node of this.nodes) node.DrawNodeConnections(this.CanvasCtx_main);
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

        const startNodes = this.nodes
            .filter(n => n.nodeData.alwaysGenerate > 0)
            .sort((a, b) => b.nodeData.alwaysGenerate - a.nodeData.alwaysGenerate);
        debug.log("Amount of start nodes:", startNodes.length);

        const emitted = new Set<number>();
        const inStack = new Set<number>();

        function EvalInputs(current: LBNode, data: {input:Record<string, string>,output:Record<string, string>}, doCon = false){
            for(const io of current.nodeData.inputs){
                if(io.type === "Connection" && io.connectedTo?.node && doCon) data.input[io.uniqueId] = ParseNode(io.connectedTo.node) ?? "";
                else if(io.code) data.input[io.uniqueId] = (data.input[io.uniqueId] ?? "") + (io.code(data) ?? "");
                else if(io.value != undefined && io.value != null) data.input[io.uniqueId] = io.value ?? "";
                else if(io.connectedTo?.node){
                    const con = io.connectedTo;
                    const node = io.connectedTo.node;

                    const childData = {input: {} as Record<string, any>, output: {} as Record<string, any>};
                    EvalInputs(node, childData, true);

                    if(con.code){
                        debug.log("Giving values:", childData, "to con.code");
                        data.input[io.uniqueId] = con.code(childData) ?? "";
                    }
                }
                else data.input[io.uniqueId] = "";
            }
        }

        function ParseNode(current: LBNode){
            if(!current) return "";
            const id = current.nodeData.uuid;

            if(emitted.has(id) || inStack.has(id)) return "";
            let data = {input:{} as Record<string, string>, output:{} as Record<string, string>};
            inStack.add(id);

            debug.log("Parsing node:", current.nodeData.uniqueId);

            EvalInputs(current, data, true);
            /*for(const io of current.nodeData.inputs){
                if(io.type === "Connection" && io.connectedTo?.node) data.input[io.uniqueId] = ParseNode(io.connectedTo.node) ?? "";
                if(io.code) data.input[io.uniqueId] = (data.input[io.uniqueId] ?? "") + (io.code(data) ?? "");
                else if(io.value != undefined && io.value != null) data.input[io.uniqueId] = io.value ?? "";
                else if(io.connectedTo?.node){
                    const con = io.connectedTo;
                    const node = io.connectedTo.node;

                    const childData = {input: {} as Record<string, any>, output: {} as Record<string, any>};
                    EvalInputs(node, childData);

                    if(con.code){
                        data.input[io.uniqueId] = con.code(childData) ?? "";
                    }
                }
            }*/

            for(const io of current.nodeData.outputs){
                if(io.code){
                    const code = io.code(data) ?? "";
                    const out = data.output[io.uniqueId] ?? "";
                    debug.log("[Def] Setting data.output[", io.uniqueId, "] to", code, "\nwith additional data:", out, "\ncurrent:", current.nodeData.uniqueId);
                    data.output[io.uniqueId] = out + code;
                }
                if(io.type === "Connection" && io.connectedTo?.node){
                    debug.log("Visiting (from => to):", current.nodeData.uniqueId, "=>", io.connectedTo.node.nodeData.uniqueId);
                    const code = ParseNode(io.connectedTo.node) ?? "";
                    const out = data.output[io.uniqueId] ?? "";
                    debug.log("[Con] Setting data.output[", io.uniqueId, "] to", code, "\nwith additional data:", out, "\ncurrent:", current.nodeData.uniqueId);
                    data.output[io.uniqueId] = out + code;
                }
            }

            const nodeCode = current.nodeData.code?.(data) ?? "";
            let fullCode = nodeCode;
            for(const io of current.nodeData.outputs){
                if(io.type === "Connection" && data.output[io.uniqueId])
                    fullCode += data.output[io.uniqueId];
            }

            emitted.add(id);
            inStack.delete(id);

            debug.log("Executing code for:", current.nodeData.uniqueId);
            return fullCode;
        }

        let code = "";

        for(const node of startNodes){
            debug.log("Parsing node:", node.nodeData.uniqueId, "with priority:", node.nodeData.alwaysGenerate);
            try{
                code += ParseNode(node);
            }catch(e){
                console.error("Error parsing node graph on node:\n" + node.nodeData.uniqueId +
                    " (" + node.nodeData.uuid + ")\n", "------Stack Trace------\n", e);
                code += "[ERROR] Failed to parse node graph.";
            }
        }

        debug.groupEnd();

        console.log(code);
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
