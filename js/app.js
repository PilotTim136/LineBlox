"use strict";
let DEBUG = false;
const debug = {
    log: (message, ...optionalParams) => { if (DEBUG)
        console.log(message, ...optionalParams); },
    warn: (message, ...optionalParams) => { if (DEBUG)
        console.warn(message, ...optionalParams); },
    error: (message, ...optionalParams) => { if (DEBUG)
        console.error(message, ...optionalParams); },
    group: (...label) => { if (DEBUG)
        console.group(...label); }, groupEnd: () => { if (DEBUG)
        console.groupEnd(); }
};
class LB_NodeSettings {
    static drawSimple = false;
}
class Vector2 {
    x;
    y;
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    static #zero = new Vector2();
    static get zero() { return Vector2.#zero; }
    add(v) { return new Vector2(this.x + v.x, this.y + v.y); }
    subtract(v) { return new Vector2(this.x - v.x, this.y - v.y); }
    multiply(scalar) { return new Vector2(this.x * scalar, this.y * scalar); }
    divide(scalar) { return new Vector2(this.x / scalar, this.y / scalar); }
    equals(v) { return this.x === v.x && this.y === v.y; }
    static Add(v1, v2) { return new Vector2(v1.x + v2.x, v1.y + v2.y); }
    static Subtract(v1, v2) { return new Vector2(v1.x - v2.x, v1.y - v2.y); }
    static Multiply(v, scalar) { return new Vector2(v.x * scalar, v.y * scalar); }
    static Divide(v, scalar) { return new Vector2(v.x / scalar, v.y / scalar); }
    toJson() { return { x: this.x, y: this.y }; }
    fromJson(json) {
        this.x = json.x ?? 0;
        this.y = json.y ?? 0;
        return this;
    }
    static fromJson(json) { return new Vector2(json.x, json.y); }
    clone() { return new Vector2(this.x, this.y); }
}
class Color {
    r;
    g;
    b;
    a;
    constructor(r = 0, g = 0, b = 0, a = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    toRgbaString() { return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`; }
    fromRgbaString(rgba) {
        const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/);
        if (!match)
            return new Color();
        this.r = parseInt(match[1]);
        this.g = parseInt(match[2]);
        this.b = parseInt(match[3]);
        this.a = match[4] !== undefined ? parseFloat(match[4]) : 1;
        return this;
    }
    toHexString() {
        const rHex = this.r.toString(16).padStart(2, '0');
        const gHex = this.g.toString(16).padStart(2, '0');
        const bHex = this.b.toString(16).padStart(2, '0');
        return `#${rHex}${gHex}${bHex}`;
    }
    fromHexString(hex) {
        if (hex.startsWith('#'))
            hex = hex.slice(1);
        if (hex.length !== 6)
            throw new Error("Invalid hex color string");
        this.r = parseInt(hex.slice(0, 2), 16);
        this.g = parseInt(hex.slice(2, 4), 16);
        this.b = parseInt(hex.slice(4, 6), 16);
        return this;
    }
    static fromHexString(hex) {
        if (hex.startsWith('#'))
            hex = hex.slice(1);
        if (hex.length !== 6)
            throw new Error("Invalid hex color string");
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return new Color(r, g, b, 1);
    }
    static fromRgbaString(rgba) {
        const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/);
        if (!match)
            return new Color();
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        const a = match[4] !== undefined ? parseFloat(match[4]) : 1;
        return new Color(r, g, b, a);
    }
    static darken(amount, col) {
        const base = typeof col === "string" ? Color.fromRgbaString(col) : col;
        base.r -= amount;
        base.g -= amount;
        base.b -= amount;
        base.r = Math.min(Math.max(base.r, 0), 255);
        base.g = Math.min(Math.max(base.g, 0), 255);
        base.b = Math.min(Math.max(base.b, 0), 255);
        return base;
    }
    darken(amount) {
        this.r -= amount;
        this.g -= amount;
        this.b -= amount;
        this.r = Math.min(Math.max(this.r, 0), 255);
        this.g = Math.min(Math.max(this.g, 0), 255);
        this.b = Math.min(Math.max(this.b, 0), 255);
        return this;
    }
    toJson() {
        return { r: this.r, g: this.g, b: this.b, a: this.a };
    }
    fromJson(json) {
        this.r = json.r ?? 0;
        this.g = json.g ?? 0;
        this.b = json.b ?? 0;
        this.a = json.a ?? 1;
        return this;
    }
    static fromJson(json) {
        return new Color(json.r, json.g, json.b, json.a);
    }
    clone() { return new Color(this.r, this.g, this.b, this.a); }
}
class LB_NodeIO {
    name = "";
    type = "Any";
    uniqueId = "LB_uniqueIO1";
    continueCode = false;
    hidden = false;
    integrated = false;
    node = null;
    acceptedTypes = [];
    connectedTo = null;
    connections = [];
    connectedToId = 0;
    boxWidth = 14;
    allowMultiple = true;
    #uuid = 0;
    value = null;
    get uuid() { return this.#uuid; }
    set setUuid(val) { this.#uuid = val; }
    code = null;
    constructor(name, type, uniqueId, allowMultiple, continueCode) {
        if (name)
            this.name = name;
        if (type)
            this.type = type;
        if (uniqueId)
            this.uniqueId = uniqueId;
        if (continueCode != undefined)
            this.continueCode = continueCode;
        if (allowMultiple != undefined)
            this.allowMultiple = allowMultiple;
        this.acceptedTypes[0] = type ?? this.type;
        this.#uuid = LBInstance.GenerateUUID();
    }
    Clone() {
        const io = new LB_NodeIO();
        io.name = this.name;
        io.type = this.type;
        io.uniqueId = this.uniqueId;
        io.continueCode = this.continueCode;
        io.acceptedTypes = this.acceptedTypes;
        io.#uuid = LBInstance.GenerateUUID();
        io.code = this.code;
        io.hidden = this.hidden;
        io.integrated = this.integrated;
        io.boxWidth = this.boxWidth;
        return io;
    }
    toJSON() {
        return {
            connectionId: this.connectedToId,
            uuid: this.#uuid
        };
    }
    fromJSON(json) {
        this.connectedToId = json.connectionId ?? 0;
        this.#uuid = json.uuid ?? 0;
    }
}
class LB_Background {
    static DrawBG(data, drawGrid = false) {
        const ctx = data.context;
        const zoom = data.zoom;
        const scrollPos = data.scrollPos;
        ctx.setTransform(zoom, 0, 0, zoom, -scrollPos.x * zoom, -scrollPos.y * zoom);
        const width = ctx.canvas.width / zoom;
        const height = ctx.canvas.height / zoom;
        ctx.fillStyle = "#303030";
        ctx.fillRect(scrollPos.x, scrollPos.y, width + scrollPos.x, height + scrollPos.y);
        if (!drawGrid)
            return;
        const gridSize = 25;
        ctx.strokeStyle = "#5a5a5a";
        ctx.lineWidth = 1 / zoom;
        const offsetX = scrollPos.x % gridSize;
        const offsetY = scrollPos.y % gridSize;
        for (let x = -offsetX; x <= width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x + scrollPos.x, scrollPos.y);
            ctx.lineTo(x + scrollPos.x, height + scrollPos.y);
            ctx.stroke();
        }
        for (let y = -offsetY; y <= height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(scrollPos.x, y + scrollPos.y);
            ctx.lineTo(width + scrollPos.x, y + scrollPos.y);
            ctx.stroke();
        }
    }
    static DrawScroll(data, hideHorizontal = false, hideVertical = false) {
        const ctx = data.context;
        const canvas = data.element;
        const barSizePx = 12;
        const zoom = data.zoom;
        const maxScroll = data.maxScroll;
        const scrollPos = data.scrollPos;
        const viewW = canvas.width / zoom;
        const viewH = canvas.height / zoom;
        const barSize = barSizePx / zoom;
        const contentW = Math.max(viewW, maxScroll.x + viewW);
        const contentH = Math.max(viewH, maxScroll.y + viewH);
        const thumbW = (viewW * viewW) / contentW;
        const thumbH = (viewH * viewH) / contentH;
        const minThumb = 10 / zoom;
        const finalThumbW = Math.max(minThumb, Math.min(viewW, thumbW));
        const finalThumbH = Math.max(minThumb, Math.min(viewH, thumbH));
        const thumbX = (maxScroll.x > 0) ? (scrollPos.x / maxScroll.x) * (viewW - finalThumbW) : 0;
        const thumbY = (maxScroll.y > 0) ? (scrollPos.y / maxScroll.y) * (viewH - finalThumbH) : 0;
        if (!hideHorizontal) {
            ctx.fillStyle = "#444";
            ctx.fillRect(scrollPos.x, scrollPos.y + viewH - barSize, viewW, barSize);
            ctx.fillStyle = "#888";
            ctx.fillRect(scrollPos.x + thumbX, scrollPos.y + viewH - barSize, finalThumbW, barSize);
        }
        if (!hideVertical) {
            ctx.fillStyle = "#444";
            ctx.fillRect(scrollPos.x + viewW - barSize, scrollPos.y, barSize, viewH);
            ctx.fillStyle = "#888";
            ctx.fillRect(scrollPos.x + viewW - barSize, scrollPos.y + thumbY, barSize, finalThumbH);
        }
    }
    static LogicScroll(data, type, e, ignoreHorizontal = false, ignoreVertical = false) {
        const canvas = data.element;
        const zoom = data.zoom;
        const barSizePx = 12;
        const state = data.sliderData[0] ??= {
            isDraggingH: false,
            isDraggingV: false,
            dragStart: new Vector2(0, 0),
            scrollStart: new Vector2(0, 0)
        };
        const viewW = canvas.width / zoom;
        const viewH = canvas.height / zoom;
        const thumbW = (viewW * viewW) / (viewW + data.maxScroll.x);
        const thumbH = (viewH * viewH) / (viewH + data.maxScroll.y);
        const thumbX = (data.maxScroll.x > 0) ? (data.scrollPos.x / data.maxScroll.x) * (viewW - thumbW) : 0;
        const thumbY = (data.maxScroll.y > 0) ? (data.scrollPos.y / data.maxScroll.y) * (viewH - thumbH) : 0;
        if (type === "down" && e) {
            const mx = e.offsetX / zoom;
            const my = e.offsetY / zoom;
            if (!ignoreHorizontal) {
                if (my >= viewH - barSizePx / zoom &&
                    mx >= thumbX && mx <= thumbX + thumbW) {
                    state.isDraggingH = true;
                    state.dragStart.x = mx;
                    state.scrollStart.x = data.scrollPos.x;
                }
            }
            if (!ignoreVertical) {
                if (mx >= viewW - barSizePx / zoom &&
                    my >= thumbY && my <= thumbY + thumbH) {
                    state.isDraggingV = true;
                    state.dragStart.y = my;
                    state.scrollStart.y = data.scrollPos.y;
                }
            }
        }
        if (type === "move" && e) {
            const mx = e.offsetX / zoom;
            const my = e.offsetY / zoom;
            if (state.isDraggingH) {
                const dx = (mx - state.dragStart.x) / (viewW - thumbW) * data.maxScroll.x;
                data.scrollPos.x = Math.max(0, Math.min(data.maxScroll.x, state.scrollStart.x + dx));
            }
            if (state.isDraggingV) {
                const dy = (my - state.dragStart.y) / (viewH - thumbH) * data.maxScroll.y;
                data.scrollPos.y = Math.max(0, Math.min(data.maxScroll.y, state.scrollStart.y + dy));
            }
        }
        if (type === "up") {
            state.isDraggingH = false;
            state.isDraggingV = false;
        }
    }
}
class LB_CanvasData {
    element;
    context;
    scrollPos = new Vector2(0, 0);
    maxScroll = new Vector2(2000, 2000);
    zoom = 1;
    sliderData = [];
    onScrollLogic;
    mousePos = new Vector2(0, 0);
    mousePosWorld = new Vector2(0, 0);
    mouseClicked = false;
    mouseHold = false;
    mouseDown = false;
    movedMouseSinceClick = false;
    LF_mousePosWorld = Vector2.zero;
    canDrag = true;
    clickFrame = 0;
    ignoreVertical = false;
    ignoreHorizontal = false;
    constructor(elm, ctx) {
        this.element = elm;
        this.context = ctx;
        elm.addEventListener("mousedown", this.#onMouseDown.bind(this));
        window.addEventListener("mousemove", this.#onMouseMove.bind(this));
    }
    #onMouseDown(e) {
        if (e.button !== 0)
            return;
        this.UpdateMouseData(e);
        LBInstance.LBInstance.selectedNode = null;
        this.mouseClicked = true;
        this.mouseDown = true;
        this.movedMouseSinceClick = false;
        this.onScrollLogic?.(this, "down", e, this.ignoreHorizontal, this.ignoreVertical);
    }
    #onMouseMove(e) {
        this.onScrollLogic?.(this, "move", e, this.ignoreHorizontal, this.ignoreVertical);
        if (this.mouseDown)
            this.movedMouseSinceClick = true;
    }
    #onMouseUp() {
        this.mouseClicked = false;
        this.mouseHold = false;
        this.canDrag = true;
        this.mouseDown = false;
        this.movedMouseSinceClick = false;
        this.onScrollLogic?.(this, "up", undefined, this.ignoreHorizontal, this.ignoreVertical);
    }
    OnMouseUp() { this.#onMouseUp(); }
    UpdateMouseData(e, fromThis = false) {
        if (fromThis) {
            this.mousePos = new Vector2(e.offsetX, e.offsetY);
        }
        else {
            const rect = this.element.getBoundingClientRect();
            this.mousePos = new Vector2((e.clientX - rect.left) / this.zoom, (e.clientY - rect.top) / this.zoom);
        }
        this.mousePosWorld = this.mousePos.add(this.scrollPos);
    }
}
class LB_ContextData {
    isObject = false;
    objectReference = null;
}
class LB_ContextMenu {
    #ctx = null;
    #canvas = null;
    #hasCtx = false;
    #pos = Vector2.zero;
    #size = Vector2.zero;
    #buttons = [];
    #mainCanvas = null;
    #context = null;
    #ySpacing = 30;
    get OpenContext() { return this.#hasCtx; }
    #ctxSizeX = 150;
    Create(pos, cnv, data) {
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
        this.#ctx = contextCanvas.getContext("2d");
        this.#size = new Vector2(this.#ctxSizeX, 100);
        this.#ctx.textAlign = "center";
        this.#ctx.textBaseline = "middle";
        this.#ctx.font = "12px Sans-Serif";
        this.#pos = pos;
        if (pos.x + this.#size.x > window.innerWidth)
            this.#pos.x = window.innerWidth - this.#size.x - 15;
        if (pos.y + this.#size.y > window.innerHeight)
            this.#pos.y = window.innerHeight - this.#size.y - 15;
    }
    OnClick(e) {
        if (!this.#hasCtx)
            return;
        if (this.#pos.x + this.#size.x > e.clientX && this.#pos.x < e.clientX &&
            this.#pos.y + this.#size.y > e.clientY && this.#pos.y < e.clientY) {
            const size = new Vector2(this.#size.x - this.#ySpacing, 30);
            for (const btn of this.#buttons) {
                if (btn.pos.x + size.x > e.clientX && btn.pos.x < e.clientX &&
                    btn.pos.y + size.y > e.clientY && btn.pos.y < e.clientY) {
                    btn.callback?.();
                    if (btn.closeOnClick)
                        this.Close();
                }
            }
        }
        else {
            this.Close();
        }
    }
    Draw() {
        if (!this.#hasCtx)
            return;
        this.#buttons = [];
        if (this.#ctx === null) {
            console.warn("[ContextMenu.ts - Draw] Cant access context with invalid RenderingContext!");
            return;
        }
        const ctx = this.#ctx;
        const pos = this.#pos;
        let buttonsToCreate = [];
        if (!this.#context?.isObject) {
            buttonsToCreate = [];
        }
        else {
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
                        if (node == undefined)
                            return;
                        LBInstance.LBInstance.nodes.push(node);
                    }
                },
                {
                    name: "Log",
                    closeOnClick: true,
                    onClick: () => {
                        if (!DEBUG) {
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
        for (const btn of buttonsToCreate) {
            this.#drawButton(btn.name, new Vector2(0, cY), btn.onClick, btn.closeOnClick ?? true);
            cY += this.#ySpacing;
        }
    }
    #drawButton(text, pos, onClick, closeOnClick = true) {
        if (!this.#ctx || !this.#mainCanvas) {
            console.warn("[ContextMenu.ts - drawButton] Tried to call drawButton without valid RenderingContext/MainCanvas!");
            return;
        }
        const size = new Vector2(this.#size.x, this.#ySpacing);
        const absX = this.#pos.x + pos.x;
        const absY = this.#pos.y + pos.y;
        const mpos = LBInstance.globalMousePos;
        const isHovering = mpos.x >= absX &&
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
    Close() {
        if (this.#hasCtx) {
            if (this.#canvas !== null)
                this.#canvas.remove();
            this.#hasCtx = false;
        }
    }
}
class LBCreator {
    static #registeredNodes = [];
    static get registeredNodes() { return this.#registeredNodes; }
    static RegisterNodeAdvanced(data) {
        if (this.#registeredNodes.find(v => v.uniqueId === data.uniqueId)) {
            console.warn("[LBCreator] Cannot register node that has the same uId as a node that's already registered.");
            return;
        }
        this.#registeredNodes.push(data);
        debug.log("Node [", data.uniqueId, "] registered! Registered nodes:", this.#registeredNodes.length);
    }
    static RegisterNode(data) {
        function addIo(doIo, ioField) {
            ioField.length = 0;
            for (const io of doIo ?? []) {
                const nio = new LB_NodeIO();
                nio.uniqueId = io.id;
                nio.name = io.name;
                nio.type = io.type;
                nio.allowMultiple = io.allowMultiple;
                nio.continueCode = io.continueCode;
                nio.code = io.code;
                nio.hidden = io.hide;
                nio.integrated = io.integrated;
                nio.boxWidth = io.boxWidth;
                ioField.push(nio);
            }
        }
        const nd = new LB_NodeData();
        nd.uniqueId = data.id ?? "__node__";
        nd.publicName = data.publicName ?? "Node";
        nd.color = data.color ?? Color.fromHexString("#bd8100");
        nd.size.x = data.width ?? 100;
        nd.dynamicHeight = data.dynamicHeight ?? false;
        nd.category = data.category ?? "Example";
        nd.code = data.code ?? null;
        nd.alwaysGenerate = data.alwaysGenerate;
        addIo(data.inputs, nd.inputs);
        addIo(data.outputs, nd.outputs);
        this.RegisterNodeAdvanced(nd);
    }
    static RemoveNode(data) {
        if (typeof (data) === "string")
            this.#registeredNodes = this.#registeredNodes.filter(v => v.uniqueId !== data);
        else if (data instanceof LB_NodeData)
            this.#registeredNodes = this.#registeredNodes.filter(v => v !== data);
        else
            console.warn("[LBCreator] Invalid uId type (accepting <String> or <LB_NodeData>)");
    }
    static GetNodeById(id) {
        return this.#registeredNodes.find(n => n.uniqueId === id);
    }
}
class LBNode {
    position;
    nodeData;
    color;
    alwaysDraw = false;
    isDragging = false;
    isDraggingLine = false;
    dragOffset = new Vector2();
    lineDragStart = new Vector2();
    generatedHitboxes = false;
    dragFromHitbox = null;
    #darkerRgba;
    #willBeUsed;
    constructor(pos, data, willBeUsed = true) {
        this.position = pos;
        this.color = data.color;
        for (const io of data.inputs)
            io.node = this;
        for (const io of data.outputs)
            io.node = this;
        this.#darkerRgba = data.color.clone().darken(50).toRgbaString();
        this.#willBeUsed = willBeUsed;
        data.RegenerateHeight();
        this.nodeData = data;
    }
    Input(canvas) {
        if (!this.#willBeUsed)
            return;
        const inst = LBInstance.LBInstance;
        if (this.IsInNode(canvas.mousePosWorld) && canvas.mouseClicked && inst.selectedNode !== this) {
            inst.selectedNode = this;
        }
        const thisNode = this;
        function CheckNodes(input) {
            for (const io of input) {
                if (!io.node)
                    continue;
                let foundNode = false;
                for (const node of inst.nodes) {
                    if (node === thisNode || !io.connectedTo?.node)
                        continue;
                    foundNode = io.connectedTo.node.nodeData.uuid === node.nodeData.uuid;
                    if (foundNode)
                        break;
                }
                if (!foundNode) {
                    io.connectedTo = null;
                    io.connectedToId = 0;
                }
            }
        }
        CheckNodes(this.nodeData.inputs);
    }
    DrawNode(canvas, ignoreBoundsX = false) {
        const ctx = canvas.context;
        const zoom = canvas.zoom;
        const nodePos = this.position;
        const nodeColor = this.color;
        const nodeData = this.nodeData;
        const nodeSize = nodeData.size;
        if (!ignoreBoundsX)
            if (nodePos.x < 0)
                nodePos.x = 0;
        if (nodePos.y < 0)
            nodePos.y = 0;
        const isInView = this.#isInView(canvas, nodePos, nodeSize);
        if (!isInView)
            return;
        const rgbastr = nodeColor.toRgbaString();
        ctx.fillStyle = rgbastr;
        if (LB_NodeSettings.drawSimple)
            ctx.fillRect(nodePos.x, nodePos.y, nodeSize.x, nodeSize.y);
        else {
            let fill;
            if (zoom > 0.6 || !this.#willBeUsed) {
                fill = ctx.createLinearGradient(nodePos.x, nodePos.y, nodePos.x, nodePos.y + 14);
                fill.addColorStop(0, rgbastr);
                fill.addColorStop(1, this.#darkerRgba);
            }
            else
                fill = rgbastr;
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
            if (LBInstance.LBInstance.selectedNode === this) {
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
    #drawInput(ctx, drawPos, io) {
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
    #absBase = 25;
    #drawIO(ctx, nodePos, nodeSize, nodeData) {
        const inputs = nodeData.inputs;
        const outputs = nodeData.outputs;
        const height = nodeData.ioHeight;
        const absBase = this.#absBase;
        const baseY = nodePos.y + absBase;
        const r = 5;
        const calcR = r + 3;
        if (nodeData.dynamicHeight)
            this.generatedHitboxes = false || !this.#willBeUsed;
        if (!this.generatedHitboxes)
            nodeData.ioHitboxes = [];
        const hitSize = 10;
        const hitSizeHalf = hitSize / 2;
        const hitboxY = 3 + hitSizeHalf;
        ctx.textAlign = "left";
        for (let i = 0; i < inputs.length; i++) {
            const data = inputs[i];
            const y = baseY + (i * height);
            ctx.fillStyle = "#ffffff";
            ctx.fillText(data.name, nodePos.x + calcR, y, nodeSize.x / 2 - calcR);
            if (data.integrated)
                this.#drawInput(ctx, { x: nodePos.x + calcR + ctx.measureText(data.name).width, y: y - 8 }, data);
            if (data.hidden)
                continue;
            ctx.fillStyle = LBInstance.nodeColorData[data.type] ?? "#ffffff";
            if (data.type != "Connection")
                LBNode.DrawCircle(ctx, nodePos.x, y - 3.5, r);
            else
                LBNode.DrawTriangle(ctx, nodePos.x - 4, y - 3.5, r * 2);
            if (!this.#willBeUsed)
                continue;
            if (this.generatedHitboxes)
                continue;
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
        for (let i = 0; i < outputs.length; i++) {
            const data = outputs[i];
            const y = baseY + (i * height);
            ctx.fillStyle = "#ffffff";
            ctx.fillText(data.name, nodePos.x + nodeSize.x - calcR, y, nodeSize.x / 2 - calcR);
            if (data.hidden)
                continue;
            ctx.fillStyle = LBInstance.nodeColorData[data.type] ?? "#ffffff";
            if (data.type != "Connection")
                LBNode.DrawCircle(ctx, nodePos.x + nodeSize.x, y - 3.5, r);
            else
                LBNode.DrawTriangle(ctx, nodePos.x + nodeSize.x - 4, y - 3.5, r * 2);
            if (!this.#willBeUsed)
                continue;
            if (this.generatedHitboxes)
                continue;
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
    DrawNodeConnections(canvas) {
        const ctx = canvas.context;
        const nodeData = this.nodeData;
        const inputs = nodeData.inputs;
        const nodePos = this.position;
        const absBase = this.#absBase;
        const baseY = nodePos.y + absBase;
        const height = nodeData.ioHeight;
        const hitSize = 10;
        const hitSizeHalf = hitSize / 2;
        const hitboxY = 3 + hitSizeHalf;
        for (let i = 0; i < inputs.length; i++) {
            const data = inputs[i];
            const y = baseY + (i * height);
            if (data.connectedTo != null && data.connectedTo.node != null) {
                const start = new Vector2(nodePos.x, y - hitboxY + 5);
                const targetNode = data.connectedTo.node;
                const ioIndex = targetNode.nodeData.outputs.indexOf(data.connectedTo);
                const targetY = targetNode.position.y + absBase - 3.5 + ioIndex * height;
                const end = new Vector2(targetNode.position.x + targetNode.nodeData.size.x, targetY);
                LBNode.DrawLine(ctx, start, end);
            }
        }
    }
    #drawNodeName(ctx, nodePos, nodeSize, nodeData) {
        ctx.strokeStyle = "#ffffff";
        ctx.font = "12px Sans-Serif";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText(nodeData.publicName, nodePos.x + nodeSize.x / 2, nodePos.y + 12, nodeSize.x);
    }
    Remove() {
        const inst = LBInstance.LBInstance;
        const index = inst.nodes.indexOf(this);
        if (index !== -1)
            inst.nodes.splice(index, 1);
    }
    OnDragStop(mouseWorld) {
        this.#connectLine(mouseWorld);
    }
    DragNode(canvas, override = false) {
        if (!this.#willBeUsed && !override)
            return;
        if (!canvas.canDrag && !this.isDragging)
            return;
        const mouseWorld = canvas.mousePosWorld;
        this.#checkDragLine(canvas, mouseWorld);
        if (this.isDraggingLine)
            return;
        this.#checkDragNode(canvas, mouseWorld);
    }
    #checkDragLine(canvas, mouseWorld) {
        const hitboxes = this.nodeData.ioHitboxes;
        const ctx = canvas.context;
        if (canvas.mouseClicked) {
            for (const hb of hitboxes) {
                if (LBNode.IsPointInHitbox(hb, mouseWorld)) {
                    this.isDraggingLine = true;
                    this.lineDragStart = new Vector2(hb.x + hb.w / 2, hb.y + hb.h / 2);
                    this.dragFromHitbox = hb;
                    return;
                }
            }
        }
        if (this.isDraggingLine)
            LBNode.DrawLine(ctx, this.lineDragStart, mouseWorld);
    }
    #checkDragNode(canvas, mouseWorld) {
        if (this.isDraggingLine)
            return;
        const inNode = this.IsInNode(mouseWorld);
        if (this.isDragging) {
            this.position = mouseWorld.add(this.dragOffset);
        }
        else {
            if (!inNode || !canvas.mouseClicked)
                return;
            canvas.canDrag = false;
            this.isDragging = true;
            this.dragOffset = this.position.subtract(mouseWorld);
            this.PushBack();
        }
    }
    #isInView(canvas, nodePos, nodeSize) {
        if (this.alwaysDraw)
            return true;
        const viewX = canvas.scrollPos.x;
        const viewY = canvas.scrollPos.y;
        const viewW = canvas.element.width / canvas.zoom;
        const viewH = canvas.element.height / canvas.zoom;
        return nodePos.x + nodeSize.x > viewX &&
            nodePos.x < viewX + viewW &&
            nodePos.y + nodeSize.y > viewY &&
            nodePos.y < viewY + viewH;
    }
    IsInNode(pos) {
        const inNodeX = pos.x >= this.position.x && pos.x <= this.position.x + this.nodeData.size.x;
        const inNodeY = pos.y >= this.position.y && pos.y <= this.position.y + this.nodeData.size.y;
        return inNodeX && inNodeY;
    }
    PushBack() {
        const inst = LBInstance.LBInstance;
        const index = inst.nodes.indexOf(this);
        if (index !== -1)
            inst.nodes.splice(index, 1);
        inst.nodes.push(this);
    }
    Clone(resetWillBeUsed = false) {
        const ndClone = this.nodeData.Clone();
        const n = new LBNode(this.position, ndClone, this.#willBeUsed);
        if (resetWillBeUsed)
            n.#willBeUsed = true;
        n.nodeData.ResetUuids();
        return n;
    }
    #connectLine(mouseWorld) {
        if (!this.isDraggingLine || !this.dragFromHitbox)
            return;
        const nodes = LBInstance.LBInstance.nodes;
        const thisHitbox = this.dragFromHitbox;
        for (const node of nodes) {
            const hitboxes = node.nodeData.ioHitboxes;
            if (node === this)
                continue;
            for (const hb of hitboxes) {
                if (!LBNode.IsPointInHitbox(hb, mouseWorld))
                    continue;
                const hbIo = hb.io;
                const inputIO = thisHitbox.isInput ? thisHitbox.io : hbIo;
                const outputIO = hb.isInput ? thisHitbox.io : hbIo;
                LBNode.ConnectNodes(inputIO, outputIO);
            }
        }
    }
    static ConnectNodes(inputIO, outputIO) {
        if (outputIO.type === "Connection")
            outputIO.allowMultiple = false;
        if (inputIO.connectedTo === outputIO) {
            inputIO.connectedTo = null;
            inputIO.connectedToId = 0;
            if (outputIO.type === "Connection") {
                outputIO.connections = outputIO.connections.filter(i => i !== inputIO);
            }
            return;
        }
        if (outputIO.type === "Connection") {
            inputIO.connectedTo = outputIO;
            outputIO.connectedTo = inputIO;
            outputIO.connections.push(inputIO);
            return;
        }
        if (inputIO.type.toLowerCase() !== "any" && inputIO.type !== outputIO.type)
            return;
        if (inputIO.connectedTo) {
            const oldOutput = inputIO.connectedTo;
            oldOutput.connections = oldOutput.connections.filter(i => i !== inputIO);
        }
        if (!outputIO.allowMultiple) {
            for (const oldInput of outputIO.connections) {
                oldInput.connectedTo = null;
                oldInput.connectedToId = 0;
            }
            outputIO.connections = [];
        }
        inputIO.connectedTo = outputIO;
        inputIO.connectedToId = outputIO.uuid;
        outputIO.connections.push(inputIO);
    }
    static DrawTriangle(ctx, x, y, size) {
        ctx.beginPath();
        ctx.moveTo(x, y - size / 2);
        ctx.lineTo(x + size, y);
        ctx.lineTo(x, y + size / 2);
        ctx.closePath();
        ctx.fill();
    }
    static DrawCircle(ctx, x, y, radius) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    static IsPointInHitbox(hb, pos) {
        return (pos.x >= hb.x &&
            pos.x <= hb.x + hb.w &&
            pos.y >= hb.y &&
            pos.y <= hb.y + hb.h);
    }
    static DrawLine(ctx, start, end) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    }
    isMouseOver(mouseWorld) {
        const size = this.nodeData.size;
        return mouseWorld.x >= this.position.x &&
            mouseWorld.x <= this.position.x + size.x &&
            mouseWorld.y >= this.position.y &&
            mouseWorld.y <= this.position.y + size.y;
    }
    toJson() {
        return {
            position: this.position.toJson(),
            nodeData: this.nodeData.toJson(),
            ...(DEBUG ? {
                willBeUsed: this.#willBeUsed,
                alwaysGenPriority: this.nodeData.alwaysGenerate,
                nodeUid: this.nodeData.uniqueId
            } : {})
        };
    }
    static fromJson(json) {
        const base = LBCreator.GetNodeById(json.nodeData.uniqueId);
        if (!base) {
            throw new Error("Unknown node type: " + json.nodeData.uniqueId);
        }
        const nodeData = base.Clone();
        nodeData.fromJson(json.nodeData);
        return new LBNode(Vector2.fromJson(json.position), nodeData);
    }
    static SpawnNode(spawnInWorkspace = true, node, pos = Vector2.zero) {
        const inst = LBInstance.LBInstance;
        const toCreate = LBCreator.GetNodeById(node);
        if (toCreate === undefined) {
            console.warn("Can't create node with uId [", node, "], because ID does not exist.");
            return;
        }
        const nd = toCreate.Clone();
        const n = new LBNode(pos, nd, true);
        if (spawnInWorkspace)
            inst.nodes.push(n);
        return n;
    }
}
class LB_NodeData {
    uniqueId = "LB_uniqueNode1";
    publicName = "Node";
    color = new Color(255, 165, 0);
    #hasDynamicHeight = false;
    size = new Vector2(100, 50);
    inputs = [];
    outputs = [];
    #baseHeight = 20;
    #ioHeight = 15;
    ioHitboxes = [];
    #uuid = 0;
    category = "Example";
    alwaysGenerate = 0;
    code = null;
    constructor(uniqueId = "LB_uniqueNode1", publicName = "Node", color = new Color(255, 165, 0), width = 100, inputs = [new LB_NodeIO("", "Connection", "code", true, false), new LB_NodeIO("aaaa", "String", "code2")], outputs = [new LB_NodeIO("", "Connection", "code", true, false), new LB_NodeIO("aaaa", "String", "code2")]) {
        this.#uuid = LBInstance.GenerateUUID();
        this.uniqueId = uniqueId;
        this.publicName = publicName;
        this.color = color;
        this.size.x = width;
        this.inputs = inputs;
        this.outputs = outputs;
        this.RegenerateHeight();
    }
    RegenerateHeight() {
        const baseHeight = this.#baseHeight;
        const ioHeight = this.#ioHeight;
        const maxIOs = Math.max(this.inputs.length, this.outputs.length);
        this.size.y = baseHeight + (ioHeight * maxIOs);
    }
    get dynamicHeight() { return this.#hasDynamicHeight; }
    set dynamicHeight(value) {
        this.#hasDynamicHeight = value;
        if (!value)
            this.RegenerateHeight();
    }
    get baseHeight() { return this.#baseHeight; }
    get ioHeight() { return this.#ioHeight; }
    get uuid() { return this.#uuid; }
    ResetUuids() {
        this.#uuid = LBInstance.GenerateUUID();
        for (const io of this.inputs)
            io.setUuid = LBInstance.GenerateUUID();
        for (const io of this.outputs)
            io.setUuid = LBInstance.GenerateUUID();
    }
    Clone() {
        let nd = new LB_NodeData();
        nd.inputs.length = 0;
        nd.outputs.length = 0;
        nd.uniqueId = this.uniqueId;
        nd.publicName = this.publicName;
        nd.color = this.color.clone();
        nd.dynamicHeight = this.dynamicHeight;
        nd.size = this.size.clone();
        for (const io of this.inputs)
            nd.inputs.push(io.Clone());
        for (const io of this.outputs)
            nd.outputs.push(io.Clone());
        nd.ioHitboxes = this.ioHitboxes;
        nd.category = this.category;
        nd.alwaysGenerate = this.alwaysGenerate;
        nd.code = this.code;
        nd.ResetUuids();
        return nd;
    }
    toJson() {
        return {
            uniqueId: this.uniqueId,
            nodeIO: {
                inputs: this.inputs.map(io => io.toJSON()),
                outputs: this.outputs.map(io => io.toJSON())
            },
            ...(DEBUG ? { uuid: this.#uuid } : {})
        };
    }
    fromJson(json) {
        const data = this;
        data.uniqueId = json.uniqueId ?? "LB_uniqueNode1";
        for (let i = 0; i < json.nodeIO.inputs.length; i++) {
            if (i < this.inputs.length) {
                this.inputs[i].fromJSON(json.nodeIO.inputs[i]);
            }
            else {
                console.warn("More inputs in JSON than existing node IOs");
            }
        }
        for (let i = 0; i < json.nodeIO.outputs.length; i++) {
            if (i < this.outputs.length) {
                this.outputs[i].fromJSON(json.nodeIO.outputs[i]);
            }
            else {
                console.warn("More outputs in JSON than existing node IOs");
            }
        }
        debug.log("from json: inputs:", json.nodeIO);
        return data;
    }
}
class LB_SaveSystem {
    Save() {
        console.log("Saving...");
        const inst = LBInstance.LBInstance;
        let save = [];
        debug.log("Saving nodes...");
        for (const node of inst.nodes) {
            save.push(node.toJson());
        }
        if (DEBUG) {
            console.log(save);
            console.log("PRESS ANY KEY (in browser) TO COPY TO CLIPBOARD");
            const copyToClipboard = async (e) => {
                try {
                    await navigator.clipboard.writeText(JSON.stringify(save));
                    console.log("Copied to clipboard!");
                }
                catch (err) {
                    console.error("Error while copying:", err);
                }
                window.removeEventListener("keydown", copyToClipboard);
            };
            window.addEventListener("keydown", copyToClipboard);
        }
    }
    Load(json) {
        console.log("Loading...");
        const inst = LBInstance.LBInstance;
        if (typeof (json) === "string")
            json = JSON.parse(json);
        debug.log("Placing", json.length, "Nodes...");
        for (const item of json) {
            try {
                const node = LBNode.fromJson(item);
                inst.nodes.push(node);
            }
            catch (e) {
                console.error("Error trying to spawn object: " + e);
            }
        }
        debug.log("Connecting", inst.nodes.length, "Nodes...");
        for (const node of inst.nodes) {
            for (const input of node.nodeData.inputs) {
                if (input.connectedToId === 0)
                    continue;
                const targetNode = inst.nodes.find(n => n.nodeData.outputs.some(o => o.uuid === input.connectedToId));
                if (targetNode) {
                    const output = targetNode.nodeData.outputs.find(o => o.uuid === input.connectedToId);
                    if (output)
                        LBNode.ConnectNodes(output, input);
                }
            }
        }
    }
}
class LBToolbox {
    static #categories = [];
    static #nodes = [];
    static #selectedCategory = -1;
    static #lastSelectedCategory = -2;
    static get categories() { return this.#categories; }
    static get selectedCategory() { return this.#selectedCategory; }
    static #buttonHeight = 20;
    static #spacing = 5;
    static #draggingNodeC1 = null;
    static #draggingNodeC2 = null;
    static #dragOffset = Vector2.zero;
    static RegisterCategory(cat, col = "#ffffff") {
        if (!this.#categories.some(c => c.name === cat))
            this.#categories.push({ name: cat, color: col });
        else
            console.warn("[LBToolbox] Category with that name already exists.");
    }
    static RemoveCategory(cat) {
        this.#categories = this.#categories.filter(c => c.name !== cat);
    }
    static #drawCategoryNames(canvas) {
        const ctx = canvas.context;
        ctx.font = "12px Sans-Serif";
        ctx.textAlign = "left";
        let widest = 0;
        this.#lastSelectedCategory = this.#selectedCategory;
        function getBrightness(color) {
            let r, g, b;
            if (typeof color === "string") {
                const hex = color.replace("#", "");
                r = parseInt(hex.substring(0, 2), 16);
                g = parseInt(hex.substring(2, 4), 16);
                b = parseInt(hex.substring(4, 6), 16);
            }
            else {
                r = color.r;
                g = color.g;
                b = color.b;
            }
            return (0.299 * r + 0.587 * g + 0.114 * b);
        }
        for (const cat of this.#categories) {
            const meassured = ctx.measureText(cat.name).width;
            widest = meassured > widest ? meassured : widest;
        }
        widest = Math.min(Math.max(100, widest), 150);
        let y = canvas.scrollPos.y + this.#spacing;
        for (let i = 0; i < this.#categories.length; i++) {
            const cat = this.#categories[i];
            const isSelected = this.#selectedCategory === i;
            const isHovered = canvas.mousePosWorld.x > 0 && canvas.mousePosWorld.x < widest
                && canvas.mousePosWorld.y > y && canvas.mousePosWorld.y < y + this.#buttonHeight;
            ctx.fillStyle = cat.color instanceof Color ? cat.color.toHexString() : cat.color;
            if (isSelected || isHovered) {
                ctx.fillRect(0, y, widest, this.#buttonHeight);
                ctx.fillStyle = getBrightness(cat.color) < 128 ? "white" : "black";
            }
            else
                ctx.fillRect(0, y, 10, this.#buttonHeight);
            ctx.fillText(cat.name, 0 + 15, y + 14, widest);
            y += this.#buttonHeight + this.#spacing;
            if (canvas.mouseClicked && isHovered)
                this.#selectedCategory = i;
        }
        return widest;
    }
    static #drawCategory(canvas, mainCanvas, startX, endX) {
        const mouseWorld = canvas.mousePosWorld;
        const inst = LBInstance.LBInstance;
        const creator = inst.creator;
        const totalSpace = endX - startX;
        const centerX = startX + totalSpace / 2;
        let y = this.#spacing;
        if (this.#lastSelectedCategory !== this.#selectedCategory) {
            this.#nodes.length = 0;
            const openCategory = this.#categories[this.#selectedCategory].name;
            for (const n of LBCreator.registeredNodes) {
                if (n.category !== openCategory)
                    continue;
                const nodeX = centerX - n.size.x / 2;
                const node = new LBNode(new Vector2(nodeX, y + n.size.y), n, false);
                this.#nodes.push(node);
                y += n.size.y + this.#spacing;
            }
        }
        for (const n of this.#nodes) {
            n.DrawNode(canvas);
            const isInNode = n.IsInNode(mouseWorld);
            if (canvas.mouseClicked && isInNode) {
                this.#draggingNodeC1 = n.Clone();
                this.#draggingNodeC2 = n.Clone();
                this.#dragOffset = mouseWorld.clone().subtract(n.position);
            }
        }
        if (this.#draggingNodeC1 !== null && this.#draggingNodeC2 !== null) {
            const pos = mouseWorld.clone().subtract(this.#dragOffset);
            this.#draggingNodeC1.position = pos;
            const v2 = pos.clone();
            v2.x -= endX;
            this.#draggingNodeC2.position = v2;
            this.#draggingNodeC1.DrawNode(canvas, true);
            this.#draggingNodeC2.DrawNode(mainCanvas, true);
            if (!canvas.mouseDown) {
                if (canvas.mousePos.x > endX) {
                    debug.log("spawn node from toolbox");
                    inst.nodes.push(this.#draggingNodeC2.Clone(true));
                }
                this.#draggingNodeC1 = null;
                this.#draggingNodeC2 = null;
            }
        }
    }
    static Draw(canvas, mainCanvas, endX) {
        const ctx = canvas.context;
        const xReq = this.#drawCategoryNames(canvas);
        const lineX = Math.min(Math.max(100, xReq), 150);
        ctx.fillStyle = "rgb(95, 95, 95)";
        ctx.fillRect(lineX, 0 + canvas.scrollPos.y, 2, canvas.element.height + canvas.scrollPos.y);
        this.#drawCategory(canvas, mainCanvas, lineX, endX);
    }
}
const body = document.body;
class LBInstance {
    static #instance;
    static #instanceDiv;
    static #globalMousePos = Vector2.zero;
    static nodeColorData = {
        "String": "rgb(255, 153, 0)",
        "Number": "rgb(0, 119, 255)",
        "Boolean": "rgb(0, 160, 35)",
        "Variable": "rgb(206, 0, 178)",
        "Array": "rgb(97, 0, 97)",
        "List": "rgb(97, 0, 97)",
    };
    #saveSystemInstance = new LB_SaveSystem();
    #toolbox = new LBToolbox();
    #creatorSystem = new LBCreator();
    CanvasCtx_main;
    CanvasCtx_bar;
    ContextInstance;
    #canvasContainer = [];
    nodes = [];
    contextMenu = false;
    contextPos = new Vector2();
    selectedNode = null;
    #frameTaskHandler = [];
    static get LBInstance() {
        let inst = LBInstance.#instance;
        if (inst == null)
            inst = new LBInstance();
        return LBInstance.#instance;
    }
    static get getLBInstance() {
        return LBInstance.#instance;
    }
    static get LBInstanceDiv() {
        return LBInstance.#instanceDiv;
    }
    static get globalMousePos() { return this.#globalMousePos; }
    get saveSystem() { return this.#saveSystemInstance; }
    get creator() { return this.#creatorSystem; }
    get toolbox() { return this.#toolbox; }
    #changeX = 400;
    constructor(pos = { x: 0, y: 0 }, size = { x: 0, y: 0 }) {
        debug.group("LineBlox Initialization");
        let goFromDefault = false;
        if (size.x = 0 && size.y == 0)
            goFromDefault = true;
        if (!goFromDefault && (size.x < 200 || size.y < 200)) {
            debug.warn("LineBlox Init: Size-Range too small! Going from default settings.");
            goFromDefault = true;
        }
        if (goFromDefault) {
            size.x = window.innerWidth - pos.x;
            size.y = window.innerHeight - pos.y;
        }
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
        let changeX = this.#changeX;
        debug.log("Creating main canvas...");
        let canvas = this.CreateCanvas(new Vector2(changeX - pos.x, 0), new Vector2(window.innerWidth - changeX, window.innerHeight - pos.y));
        app.appendChild(canvas.element);
        this.CanvasCtx_main = canvas;
        this.#canvasContainer.push(canvas);
        debug.log("Adding listeners...");
        window.addEventListener("click", e => { this.ContextInstance.OnClick(e); });
        this.CanvasCtx_main.element.addEventListener("wheel", (e) => {
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
        this.CanvasCtx_main.element.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            this.contextMenu = true;
            this.CanvasCtx_main.UpdateMouseData(e);
            const contextData = new LB_ContextData();
            for (const node of this.nodes) {
                if (node.isMouseOver(this.CanvasCtx_main.mousePosWorld)) {
                    contextData.isObject = true;
                    contextData.objectReference = node;
                    break;
                }
            }
            this.ContextInstance.Create(new Vector2(e.clientX, e.clientY), this.CanvasCtx_main, contextData);
        });
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
        window.addEventListener("resize", () => {
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
        debug.log("Adding frametasks...");
        this.#addFrameTasks();
        debug.log("Running pre-start functions...");
        this.#updateScrollBorder();
        debug.groupEnd();
        this.#onUpdate();
    }
    CreateCanvas(pos, size) {
        const canvas = document.createElement("canvas");
        canvas.style.position = "absolute";
        canvas.style.left = pos.x + "px";
        canvas.style.top = pos.y + "px";
        canvas.width = size.x;
        canvas.height = size.y;
        const ctx = canvas.getContext("2d");
        canvas.style.display = "block";
        canvas.style.margin = "0";
        canvas.style.padding = "0";
        canvas.style.border = "0";
        return new LB_CanvasData(canvas, ctx);
    }
    #processingInput = false;
    #processingDraw = false;
    #onUpdate() {
        LB_Background.DrawBG(this.CanvasCtx_main, true);
        LB_Background.DrawBG(this.CanvasCtx_bar);
        this.#updateCanvasMouseData();
        try {
            let errorLastFrame = false;
            if (this.#processingInput) {
                console.warn("Input processing failed last frame!");
                errorLastFrame = true;
            }
            this.#processingInput = true;
            this.#onNodeInput(errorLastFrame);
            this.#processingInput = false;
        }
        catch (e) {
            console.error(e);
        }
        try {
            let errorLastFrame = false;
            if (this.#processingDraw) {
                console.warn("Frame processing failed last frame!");
                errorLastFrame = true;
            }
            this.#processingDraw = true;
            this.#onDrawNode();
            this.#processingDraw = false;
        }
        catch (e) {
            console.error(e);
        }
        for (const task of this.#frameTaskHandler) {
            if (task.executeOn >= task.currentFrame) {
                task.currentFrame = 0;
                task.func();
                continue;
            }
            task.currentFrame++;
        }
        try {
            LBToolbox.Draw(this.CanvasCtx_bar, this.CanvasCtx_main, this.#changeX);
        }
        catch (e) {
            console.error(e);
        }
        if (this.contextMenu)
            this.ContextInstance.Draw();
        this.CanvasCtx_main.LF_mousePosWorld = this.CanvasCtx_main.mousePosWorld;
        LB_Background.DrawScroll(this.CanvasCtx_main);
        LB_Background.DrawScroll(this.CanvasCtx_bar, true);
        requestAnimationFrame(this.#onUpdate.bind(this));
    }
    #onNodeInput(errorLastFrame = false) {
        const canvas = this.CanvasCtx_main;
        for (const node of this.nodes) {
            node.Input(canvas);
            if (canvas.mouseDown)
                node.DragNode(canvas);
            else {
                if (!errorLastFrame)
                    node.OnDragStop(canvas.mousePosWorld);
                if (node.isDragging || node.isDraggingLine)
                    node.generatedHitboxes = false;
                node.isDragging = false;
                node.isDraggingLine = false;
            }
        }
    }
    #onDrawNode() {
        for (const node of this.nodes)
            node.DrawNodeConnections(this.CanvasCtx_main);
        for (const node of this.nodes) {
            node.DrawNode(this.CanvasCtx_main);
        }
    }
    #onKeyPress(e) {
        switch (e.key) {
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
    #updateScrollBorder() {
        const canvasData = this.CanvasCtx_main;
        let maxX = 0, maxY = 0;
        for (const node of this.nodes) {
            const nx = node.position.x * canvasData.zoom + node.nodeData.size.x + 100;
            const ny = node.position.y * canvasData.zoom + node.nodeData.size.y + 100;
            const calcX = canvasData.element.width - 50;
            const calcY = canvasData.element.height - 50;
            if (nx > calcX)
                maxX = nx - calcX > maxX ? nx - calcX : maxX;
            if (ny > calcY)
                maxY = ny + canvasData.element.height > maxY ? ny - calcY : maxY;
        }
        maxX += 20;
        maxY += 20;
        canvasData.maxScroll.x = maxX;
        canvasData.maxScroll.y = maxY;
    }
    #addFrameTasks() {
        this.#frameTaskHandler.push({
            currentFrame: 0,
            executeOn: 2,
            func: () => this.#updateScrollBorder()
        });
    }
    #updateCanvasMouseData() {
        for (const canvas of this.#canvasContainer) {
            if (canvas.mouseDown) {
                if (canvas.clickFrame !== 0) {
                    canvas.mouseClicked = false;
                    canvas.mouseHold = true;
                }
                else
                    canvas.clickFrame++;
            }
            else if (!canvas.mouseDown) {
                canvas.clickFrame = 0;
                canvas.mouseHold = false;
                canvas.mouseClicked = false;
            }
        }
    }
    GenerateCode() {
        console.log("Generating code...");
        debug.group("CODE GEN");
        const startNodes = this.nodes
            .filter(n => n.nodeData.alwaysGenerate > 0)
            .sort((a, b) => b.nodeData.alwaysGenerate - a.nodeData.alwaysGenerate);
        debug.log("Amount of start nodes:", startNodes.length);
        const emitted = new Set();
        const inStack = new Set();
        function EvalInputs(current, data, doCon = false) {
            for (const io of current.nodeData.inputs) {
                if (io.type === "Connection" && io.connectedTo?.node && doCon)
                    data.input[io.uniqueId] = ParseNode(io.connectedTo.node) ?? "";
                else if (io.code)
                    data.input[io.uniqueId] = (data.input[io.uniqueId] ?? "") + (io.code(data) ?? "");
                else if (io.value != undefined && io.value != null)
                    data.input[io.uniqueId] = io.value ?? "";
                else if (io.connectedTo?.node) {
                    const con = io.connectedTo;
                    const node = io.connectedTo.node;
                    const childData = { input: {}, output: {} };
                    EvalInputs(node, childData);
                    if (con.code) {
                        debug.log("Giving values:", childData, "to con.code");
                        data.input[io.uniqueId] = con.code(childData) ?? "";
                    }
                }
                else
                    data.input[io.uniqueId] = "";
            }
        }
        function ParseNode(current) {
            if (!current)
                return "";
            const id = current.nodeData.uuid;
            if (emitted.has(id) || inStack.has(id))
                return "";
            let data = { input: {}, output: {} };
            inStack.add(id);
            debug.log("Parsing node:", current.nodeData.uniqueId);
            EvalInputs(current, data, true);
            for (const io of current.nodeData.outputs) {
                if (io.code) {
                    const code = io.code(data) ?? "";
                    const out = data.output[io.uniqueId] ?? "";
                    debug.log("[Def] Setting data.output[", io.uniqueId, "] to", code, "\nwith additional data:", out, "\ncurrent:", current.nodeData.uniqueId);
                    data.output[io.uniqueId] = out + code;
                }
                if (io.type === "Connection" && io.connectedTo?.node) {
                    debug.log("Visiting (from => to):", current.nodeData.uniqueId, "=>", io.connectedTo.node.nodeData.uniqueId);
                    const code = ParseNode(io.connectedTo.node) ?? "";
                    const out = data.output[io.uniqueId] ?? "";
                    debug.log("[Con] Setting data.output[", io.uniqueId, "] to", code, "\nwith additional data:", out, "\ncurrent:", current.nodeData.uniqueId);
                    data.output[io.uniqueId] = out + code;
                }
            }
            const nodeCode = current.nodeData.code?.(data) ?? "";
            let fullCode = nodeCode;
            for (const io of current.nodeData.outputs) {
                if (io.type === "Connection" && data.output[io.uniqueId])
                    fullCode += data.output[io.uniqueId];
            }
            emitted.add(id);
            inStack.delete(id);
            debug.log("Executing code for:", current.nodeData.uniqueId);
            return fullCode;
        }
        let code = "";
        for (const node of startNodes) {
            debug.log("Parsing node:", node.nodeData.uniqueId, "with priority:", node.nodeData.alwaysGenerate);
            try {
                code += ParseNode(node);
            }
            catch (e) {
                console.error("Error parsing node graph on node:\n" + node.nodeData.uniqueId +
                    " (" + node.nodeData.uuid + ")\n", "------Stack Trace------\n", e);
                code += "[ERROR] Failed to parse node graph.";
            }
        }
        debug.groupEnd();
        console.log(code);
        return code;
    }
    static GenerateUUID() {
        return Date.now() + Math.floor(Math.random() * 1000);
    }
    static LBCreateInstance(pos = { x: 0, y: 0 }, size = { x: 0, y: 0 }) {
        if (this.#instance !== undefined) {
            console.warn("Tried to create LineBlox instance while there's already one existing!");
            return;
        }
        new LBInstance(pos, size);
    }
}
