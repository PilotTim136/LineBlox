type LB_ScrollState = {
    isDraggingH: boolean;
    isDraggingV: boolean;
    dragStart: Vector2;
    scrollStart: Vector2;
};
class LB_CanvasData{
    element: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    scrollPos: Vector2 = new Vector2(0, 0);
    maxScroll: Vector2 = new Vector2(2000, 2000);   //note: change this sometime: make it dynamic
    zoom: number = 1;

    sliderData: LB_ScrollState[] = [];
    onScrollLogic?: (data: LB_CanvasData, type: "down" | "move" | "up", e?: MouseEvent, ignoreHorizontal?: boolean, ignoreVertical?: boolean) => void;

    mousePos: Vector2 = new Vector2(0, 0);
    mousePosWorld: Vector2 = new Vector2(0, 0);
    mouseClicked: boolean = false;
    mouseHold: boolean = false;
    mouseDown: boolean = false;
    movedMouseSinceClick: boolean = false;

    /** The world of the mouse-position from the last frame */
    LF_mousePosWorld = Vector2.zero;

    canDrag: boolean = true;

    clickFrame: number = 0;

    ignoreVertical = false;
    ignoreHorizontal = false;

    constructor(elm: HTMLCanvasElement, ctx: CanvasRenderingContext2D){
        this.element = elm;
        this.context = ctx;

        elm.addEventListener("mousedown", this.#onMouseDown.bind(this));
        window.addEventListener("mousemove", this.#onMouseMove.bind(this));
        //elm.addEventListener("mouseup", this.#onMouseUp.bind(this));
        //elm.addEventListener("mouseleave", this.#onMouseUp.bind(this));
    }

    #onMouseDown(e: MouseEvent){
        if(e.button !== 0) return;
        this.UpdateMouseData(e);
        LBInstance.LBInstance.selectedNode = null;
        this.mouseClicked = true;
        this.mouseDown = true;
        this.movedMouseSinceClick = false;
        this.onScrollLogic?.(this, "down", e, this.ignoreHorizontal, this.ignoreVertical);
    }

    #onMouseMove(e: MouseEvent){
        //this.UpdateMouseData(e);
        this.onScrollLogic?.(this, "move", e, this.ignoreHorizontal, this.ignoreVertical);
        if(this.mouseDown) this.movedMouseSinceClick = true;
    }

    #onMouseUp(){
        this.mouseClicked = false;
        this.mouseHold = false;
        this.canDrag = true;
        this.mouseDown = false;
        this.movedMouseSinceClick = false;
        this.onScrollLogic?.(this, "up", undefined, this.ignoreHorizontal, this.ignoreVertical);
    }

    OnMouseUp(){ this.#onMouseUp(); }

    UpdateMouseData(e: MouseEvent, fromThis: boolean = false){
        if(fromThis){
            this.mousePos = new Vector2(e.offsetX, e.offsetY);
        }else{
            const rect = this.element.getBoundingClientRect();
            this.mousePos = new Vector2(
                (e.clientX - rect.left) / this.zoom,
                (e.clientY - rect.top) / this.zoom
            );
        }

        this.mousePosWorld = this.mousePos.add(this.scrollPos);
    }
}
