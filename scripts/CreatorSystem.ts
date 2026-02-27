/** This class is for helping to create Nodes for your workspace */
class LBCreator{
    static #registeredNodes: Array<LB_NodeData> = [];

    //#region GETTER/SETTER

    static get registeredNodes(): ReadonlyArray<LB_NodeData>{ return this.#registeredNodes; }

    //#endregion

    /** How the node will be registered - will fail if node with same unique ID already exists */
    static RegisterNodeAdvanced(data: LB_NodeData){
        if(this.#registeredNodes.find(v => v.uniqueId === data.uniqueId)){
            console.warn("[LBCreator] Cannot register node that has the same uId as a node that's already registered.");
            return;
        }
        this.#registeredNodes.push(data);
        debug.log("Node [", data.uniqueId, "] registered! Registered nodes:", this.#registeredNodes.length);
    }

    /** How the node will be registered - SIMPLIFIED: uses JSON instead of JS (TS) classes */
    static RegisterNode(data: any){
        function addIo(doIo: any, ioField: LB_NodeIO[]){
            ioField.length = 0;
            for(const io of doIo ?? []){
                const nio = new LB_NodeIO();
                nio.uniqueId = io.id;
                nio.name = io.name;
                nio.type = io.type;
                nio.allowMultiple = io.allowMultiple;
                nio.continueCode = io.continueCode;
                nio.code = io.code;

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

    /** Removes the node by uId (string) or by the data itself */
    static RemoveNode(data: string | LB_NodeData){
        if(typeof(data) === "string") this.#registeredNodes = this.#registeredNodes.filter(v => v.uniqueId !== data);
        else if(data instanceof LB_NodeData) this.#registeredNodes = this.#registeredNodes.filter(v => v !== data);
        else console.warn("[LBCreator] Invalid uId type (accepting <String> or <LB_NodeData>)");
    }

    static GetNodeById(id: string): LB_NodeData | undefined {
        return this.#registeredNodes.find(n => n.uniqueId === id);
    }
}
