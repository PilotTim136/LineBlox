class LBToolbox{
    static #categories: Array<{name: string, color: Color | string}> = [];
    static #nodes: Array<LBNode> = [];

    static #selectedCategory: number = -1;
    static #lastSelectedCategory: number = -2;

    static get categories(): ReadonlyArray<{name: string, color: Color | string}>{ return this.#categories; }
    static get selectedCategory(): number{ return this.#selectedCategory; }

    static #buttonHeight = 20;
    static #spacing = 5;

    static #draggingNodeC1: LBNode | null = null;  //canvas1 (toolbox)
    static #draggingNodeC2: LBNode | null = null;  //canvas2 (workspace)
    static #dragOffset: Vector2 = Vector2.zero;

    static RegisterCategory(cat: string, col: Color | string = "#ffffff"){
        if(!this.#categories.some(c => c.name === cat)) this.#categories.push({name: cat, color: col});
        else console.warn("[LBToolbox] Category with that name already exists.");
    }

    static RemoveCategory(cat: string){
        this.#categories = this.#categories.filter(c => c.name !== cat);
    }

    static #drawCategoryNames(canvas: LB_CanvasData): number{
        const ctx = canvas.context;
        ctx.font = "12px Sans-Serif";
        ctx.textAlign = "left";
        let widest = 0;
        this.#lastSelectedCategory = this.#selectedCategory;

        function getBrightness(color: Color | string): number {
            let r: number, g: number, b: number;

            if(typeof color === "string") {
                const hex = color.replace("#", "");
                r = parseInt(hex.substring(0, 2), 16);
                g = parseInt(hex.substring(2, 4), 16);
                b = parseInt(hex.substring(4, 6), 16);
            }else{
                r = color.r;
                g = color.g;
                b = color.b;
            }

            return (0.299 * r + 0.587 * g + 0.114 * b);
        }

        //check if text bigger than widest
        for(const cat of this.#categories){
            const meassured = ctx.measureText(cat.name).width;
            widest = meassured > widest ? meassured : widest;
        }
        widest = Math.min(Math.max(100, widest), 150);

        let y = canvas.scrollPos.y + this.#spacing;
        for(let i = 0; i < this.#categories.length; i++){
            const cat = this.#categories[i];
            const isSelected = this.#selectedCategory === i;
            const isHovered = canvas.mousePosWorld.x > 0 && canvas.mousePosWorld.x < widest
                && canvas.mousePosWorld.y > y && canvas.mousePosWorld.y < y + this.#buttonHeight;

            ctx.fillStyle = cat.color instanceof Color ? cat.color.toHexString() : cat.color;
            if(isSelected || isHovered){
                ctx.fillRect(0, y, widest, this.#buttonHeight);
                ctx.fillStyle = getBrightness(cat.color) < 128 ? "white" : "black";
            }
            else ctx.fillRect(0, y, 10, this.#buttonHeight);

            ctx.fillText(cat.name, 0 + 15, y + 14, widest);

            y += this.#buttonHeight + this.#spacing;

            if(canvas.mouseClicked && isHovered) this.#selectedCategory = i;
        }
        return widest;
    }

    static #drawCategory(canvas: LB_CanvasData, mainCanvas: LB_CanvasData, startX: number, endX: number){
        const mouseWorld = canvas.mousePosWorld;
        const inst = LBInstance.LBInstance;
        const creator = inst.creator;

        const totalSpace = endX - startX;
        const centerX = startX + totalSpace / 2;

        let y = this.#spacing;
        if(this.#lastSelectedCategory !== this.#selectedCategory){
            this.#nodes.length = 0;
            const openCategory = this.#categories[this.#selectedCategory].name;
            for(const n of /*creator.registeredNodes*/ LBCreator.registeredNodes){
                if(n.category !== openCategory) continue;
                const nodeX = centerX - n.size.x / 2;
                const node = new LBNode(new Vector2(nodeX, y + n.size.y), n, false);
                this.#nodes.push(node);

                y += n.size.y + this.#spacing;
            }
        }
        for(const n of this.#nodes){
            n.DrawNode(canvas);
            const isInNode = n.IsInNode(mouseWorld);
            if(canvas.mouseClicked && isInNode){
                this.#draggingNodeC1 = n.Clone();
                this.#draggingNodeC2 = n.Clone();
                this.#dragOffset = mouseWorld.clone().subtract(n.position);
            }
        }
        if(this.#draggingNodeC1 !== null && this.#draggingNodeC2 !== null){
            const pos = mouseWorld.clone().subtract(this.#dragOffset);

            this.#draggingNodeC1.position = pos;
            const v2 = pos.clone();
            v2.x -= endX
            this.#draggingNodeC2.position = v2;

            this.#draggingNodeC1.DrawNode(canvas, true);
            this.#draggingNodeC2.DrawNode(mainCanvas, true);

            if(!canvas.mouseDown){
                if(canvas.mousePos.x > endX){
                    debug.log("spawn node from toolbox");
                    inst.nodes.push(this.#draggingNodeC2.Clone(true));
                }
                this.#draggingNodeC1 = null;
                this.#draggingNodeC2 = null;
            }
        }
    }

    static Draw(canvas: LB_CanvasData, mainCanvas: LB_CanvasData, endX: number){
        const ctx = canvas.context;

        const xReq = this.#drawCategoryNames(canvas);

        const lineX = Math.min(Math.max(100, xReq), 150);
        ctx.fillStyle = "rgb(95, 95, 95)";
        ctx.fillRect(lineX, 0 + canvas.scrollPos.y, 2, canvas.element.height + canvas.scrollPos.y);

        this.#drawCategory(canvas, mainCanvas, lineX, endX);
    }
}
