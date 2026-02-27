class LB_NodeIO{
    /** The name of the input that will be shown on the node */
    name: string = "";
    /** The type of the input. Can be custom - will only be a visibility difference! */
    type: string = "Any";
    /** The unique ID of the input. This should not be the same as another input. Used to connect inputs and outputs */
    uniqueId: string = "LB_uniqueIO1";
    /** If true, will continue the code afterwards. NOTE: only one can be active on an active in-/output. Only the first one found will be used */
    continueCode: boolean = false;

    /** This is the NODE this nodeIO belongs to */
    node: LBNode | null = null;

    /** Can be any type (String, Int, Connection, ...) This will work for input and output */
    acceptedTypes: string[] = [];

    /** This is for ease of use during runtime. (NOT translating to JSON) */
    connectedTo: LB_NodeIO | null = null;
    connections: LB_NodeIO[] = [];
    /** The UUID of the node that is connected. (translating to JSON) */
    connectedToId: number = 0;
    allowMultiple: boolean = true;

    #uuid: number = 0;

    value: any;

    get uuid(): number{ return this.#uuid; }
    set setUuid(val: number){ this.#uuid = val; }

    code: ((arg: any) => string) | null = null;

    constructor(name?: string, type?: string, uniqueId?: string, allowMultiple?: boolean, continueCode?: boolean){
        if(name) this.name = name;
        if(type) this.type = type;
        if(uniqueId) this.uniqueId = uniqueId;
        if(continueCode != undefined) this.continueCode = continueCode;
        if(allowMultiple != undefined) this.allowMultiple = allowMultiple;
        this.acceptedTypes[0] = type ?? this.type;
        this.#uuid = LBInstance.GenerateUUID();
    }

    Clone(): LB_NodeIO{
        const io = new LB_NodeIO();
        io.name = this.name;
        io.type = this.type;
        io.uniqueId = this.uniqueId;
        io.continueCode = this.continueCode;
        io.acceptedTypes = this.acceptedTypes;
        io.#uuid = LBInstance.GenerateUUID();
        io.code = this.code;

        return io;
    }

    toJSON(): object{
        return {
            connectionId: this.connectedToId,
            uuid: this.#uuid
        };
    }
    fromJSON(json: any){
        this.connectedToId = json.connectionId ?? 0;
        this.#uuid = json.uuid ?? 0;
    }
}
