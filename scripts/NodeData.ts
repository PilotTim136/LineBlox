class LB_NodeData{
    /** For example "LB_uniqueNode1" - this should not be the same as another node */
    uniqueId: string = "LB_uniqueNode1";
    /** This is the name of the node. This can be the same as another node (tho it is not recommended) */
    publicName: string = "Node";
    /** The node-color */
    color: Color = new Color(255, 165, 0);
    /** If true, the node's height will have to be calculated during runtime. Will pre-generate otherwise. */
    #hasDynamicHeight: boolean = false;

    /** The pre-calculated height of the node. Only used if hasDynamicHeight is false */
    size: Vector2 = new Vector2(100, 50);

    inputs: LB_NodeIO[] = [];
    outputs: LB_NodeIO[] = [];

    #baseHeight: number = 20;
    #ioHeight: number = 15;

    /** [INTERNAL] Used for hitboxes for stuff */
    ioHitboxes: any[] = [];

    #uuid: number = 0;

    /** This is used for the toolbox. */
    category: string = "Example";

    /* wether or not the node will always generate, even if not connected - 0 is disabled! higher number means higher priority */
    alwaysGenerate: number = 0;

    code: ((arg: any) => string) | null = null;

    constructor(uniqueId = "LB_uniqueNode1", publicName = "Node", color = new Color(255, 165, 0),
        width = 100, inputs = [new LB_NodeIO("", "Connection", "code", true, false), new LB_NodeIO("aaaa", "String", "code2")],
        outputs = [new LB_NodeIO("", "Connection", "code", true, false), new LB_NodeIO("aaaa", "String", "code2")]){
        
        this.#uuid = LBInstance.GenerateUUID();

        this.uniqueId = uniqueId;
        this.publicName = publicName;
        this.color = color;
        this.size.x = width;
        this.inputs = inputs;
        this.outputs = outputs;
        this.RegenerateHeight();
    }

    RegenerateHeight(){
        const baseHeight = this.#baseHeight;
        const ioHeight = this.#ioHeight;
        const maxIOs = Math.max(this.inputs.length, this.outputs.length);
        this.size.y = baseHeight + (ioHeight * maxIOs);
    }

    get dynamicHeight(): boolean{ return this.#hasDynamicHeight; }
    set dynamicHeight(value: boolean){
        this.#hasDynamicHeight = value;
        if(!value) this.RegenerateHeight();
    }
    get baseHeight(): number{ return this.#baseHeight; }
    get ioHeight(): number{ return this.#ioHeight; }
    get uuid(): number{ return this.#uuid; }

    ResetUuids(){
        this.#uuid = LBInstance.GenerateUUID();
        for(const io of this.inputs) io.setUuid = LBInstance.GenerateUUID();
        for(const io of this.outputs) io.setUuid = LBInstance.GenerateUUID();
    }

    Clone(): LB_NodeData{
        let nd = new LB_NodeData();
        nd.inputs.length = 0;
        nd.outputs.length = 0;

        nd.uniqueId = this.uniqueId;
        nd.publicName = this.publicName;
        nd.color = this.color.clone();
        nd.dynamicHeight = this.dynamicHeight;
        nd.size = this.size.clone();
        for(const io of this.inputs) nd.inputs.push(io.Clone());
        for(const io of this.outputs) nd.outputs.push(io.Clone());
        nd.ioHitboxes = this.ioHitboxes;
        nd.category = this.category;
        nd.alwaysGenerate = this.alwaysGenerate;
        nd.code = this.code;

        nd.ResetUuids();
        return nd;
    }


    toJson(): object{
        return {
            uniqueId: this.uniqueId,
            nodeIO: {
                inputs: this.inputs.map(io => io.toJSON()),
                outputs: this.outputs.map(io => io.toJSON())
            },
            ...(DEBUG ? {uuid: this.#uuid} : {})
        };
    }
    fromJson(json: any): LB_NodeData{
        const data = this;
        data.uniqueId = json.uniqueId ?? "LB_uniqueNode1";

        for(let i = 0; i < json.nodeIO.inputs.length; i++){
            if(i < this.inputs.length){
                this.inputs[i].fromJSON(json.nodeIO.inputs[i]);
            }else{
                console.warn("More inputs in JSON than existing node IOs");
            }
        }
        for(let i = 0; i < json.nodeIO.outputs.length; i++){
            if(i < this.outputs.length){
                this.outputs[i].fromJSON(json.nodeIO.outputs[i]);
            } else {
                console.warn("More outputs in JSON than existing node IOs");
            }
        }
        debug.log("from json: inputs:", json.nodeIO);
        return data;
    }
}
