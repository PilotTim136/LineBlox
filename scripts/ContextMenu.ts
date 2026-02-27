class LB_ContextData{
    isObject: boolean = false;
    objectReference: LBNode | null = null;
}
class LB_ContextMenu{
    #ctx: CanvasRenderingContext2D | null = null;
    #canvas: HTMLCanvasElement | null = null;
    #hasCtx: boolean = false;
    #pos: Vector2 = Vector2.zero;
    #size: Vector2 = Vector2.zero;
    #buttons: any[] = [];
    #mainCanvas: LB_CanvasData | null = null;
    #context: LB_ContextData | null = null;

    #ySpacing = 30;

    get OpenContext(): boolean{ return this.#hasCtx; }

    //#region SETTINGS

    #ctxSizeX = 150;

    //#endregion

    Create(pos: Vector2, cnv: LB_CanvasData, data: LB_ContextData){
        this.Close();
        this.#hasCtx = true;
        this.#mainCanvas = cnv;
        this.#context = data;

        const contextCanvas = document.createElement("canvas");
        contextCanvas.style.position = "absolute";
        contextCanvas.style.top = "0";
        contextCanvas.style.left = "0";
        contextCanvas.width = window.innerWidth;
        contextCanvas.height = window.innerHeight;
        contextCanvas.style.pointerEvents = "none";
        body.appendChild(contextCanvas);

        this.#canvas = contextCanvas;
        this.#ctx = contextCanvas.getContext("2d")!;
        this.#size = new Vector2(this.#ctxSizeX, 100);
        this.#ctx.textAlign = "center";
        this.#ctx.textBaseline = "middle";
        this.#ctx.font = "12px Sans-Serif";
        this.#pos = pos;
        if(pos.x + this.#size.x > window.innerWidth) this.#pos.x = window.innerWidth - this.#size.x - 15;
        if(pos.y + this.#size.y > window.innerHeight) this.#pos.y = window.innerHeight - this.#size.y - 15;
    }

    OnClick(e: PointerEvent){
        if(!this.#hasCtx) return;
        //calculates if the cursor is inside the bounds, if not the case close the context menu
        if( this.#pos.x + this.#size.x > e.clientX && this.#pos.x < e.clientX &&
            this.#pos.y + this.#size.y > e.clientY && this.#pos.y < e.clientY){
            //if it is IN bounds, then check if any button was clicked
            const size = new Vector2(this.#size.x - this.#ySpacing, 30);
            for(const btn of this.#buttons){
                if( btn.pos.x + size.x > e.clientX && btn.pos.x < e.clientX &&
                    btn.pos.y + size.y > e.clientY && btn.pos.y < e.clientY){
                    btn.callback?.();
                    if(btn.closeOnClick) this.Close();
                }
            }
        }else{
            this.Close();
        }
    }

    Draw(){
        if(!this.#hasCtx) return;
        this.#buttons = [];
        if(this.#ctx === null){
            console.warn("[ContextMenu.ts - Draw] Cant access context with invalid RenderingContext!");
            return;
        }
        const ctx = this.#ctx;
        const pos = this.#pos;

        let buttonsToCreate: any[] = [];

        if(!this.#context?.isObject){
            buttonsToCreate = [];
        }else{
            buttonsToCreate = [
                {
                    name: "Delete",
                    closeOnClick: true,
                    onClick: () => this.#context?.objectReference?.Remove()
                },
                {
                    name: "Duplicate",
                    closeOnClick: true,
                    onClick: () => {
                        console.log("Clicked Duplicate on", this.#context?.objectReference?.nodeData.publicName);
                        const node = this.#context?.objectReference?.Clone(true);
                        if(node == undefined) return;
                        LBInstance.LBInstance.nodes.push(node);
                    }
                },
                {
                    name: "Log",
                    closeOnClick: true,
                    onClick: () => {
                        if(!DEBUG){
                            console.warn("This command can only be executed in DEBUG mode.");
                            return;
                        }
                        const json = this.#context?.objectReference?.toJson();
                        debug.log(json);
                    }
                }
            ];
        }
        
        this.#size.y = 30 + buttonsToCreate.length * this.#ySpacing;
        const size = this.#size;

        ctx.fillStyle = "#222222";
        ctx.roundRect(pos.x, pos.y, size.x, size.y, 10);
        ctx.fill();

        let cY = 15;
        for(const btn of buttonsToCreate){
            this.#drawButton(btn.name, new Vector2(0, cY), btn.onClick, btn.closeOnClick ?? true);
            cY += this.#ySpacing;
        }
    }

    #drawButton(text: string, pos: Vector2, onClick?: Function, closeOnClick: boolean = true){
        if(!this.#ctx || !this.#mainCanvas){
            console.warn("[ContextMenu.ts - drawButton] Tried to call drawButton without valid RenderingContext/MainCanvas!");
            return;
        }
        const size = new Vector2(this.#size.x, this.#ySpacing);
        const absX = this.#pos.x + pos.x;
        const absY = this.#pos.y + pos.y;

        const mpos = LBInstance.globalMousePos;

        const isHovering =  mpos.x >= absX &&
                            mpos.x <= absX + size.x &&
                            mpos.y >= absY &&
                            mpos.y <= absY + size.y;
        const ctx = this.#ctx;
        ctx.fillStyle = isHovering ? "#474747" : "#222222";
        ctx.fillRect(absX, absY, size.x, size.y);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(text, absX + size.x / 2, absY + size.y / 2);

        this.#buttons.push({
            pos: new Vector2(absX, absY),
            callback: onClick,
            closeOnClick: closeOnClick
        });
    }

    Close(){
        if(this.#hasCtx){
            if(this.#canvas !== null) this.#canvas.remove();
            this.#hasCtx = false;
        }
    }
}
