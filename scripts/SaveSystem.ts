class LB_SaveSystem{
    Save(){
        console.log("Saving...");
        const inst = LBInstance.LBInstance;
        let save = [];
        
        debug.log("Saving nodes...");
        for(const node of inst.nodes){
            save.push(node.toJson());
        }

        if(DEBUG){
            console.log(save);
            console.log("PRESS ANY KEY (in browser) TO COPY TO CLIPBOARD");
            //note: this is just for me as dev :)
            //TODO: remove this and make "save" and maybe "copy to clipboard" button
            const copyToClipboard = async (e: KeyboardEvent) => {
                try{
                    await navigator.clipboard.writeText(JSON.stringify(save));
                    console.log("Copied to clipboard!");
                }catch(err){
                    console.error("Error while copying:", err);
                }

                window.removeEventListener("keydown", copyToClipboard);
            };

            window.addEventListener("keydown", copyToClipboard);
        }
    }

    Load(json: string | Array<any>){
        console.log("Loading...");
        const inst = LBInstance.LBInstance;
        /*if(inst.nodes.length > 0){
            console.warn("Please remove any Node on the workspace before loading!");
            return;
        }*/

        if(typeof(json) === "string") json = JSON.parse(json);

        debug.log("Placing", json.length, "Nodes...");
        //placing
        for(const item of json){
            try{
                const node = LBNode.fromJson(item/*, inst.creator*/);
                inst.nodes.push(node);
            }catch(e){
                console.error("Error trying to spawn object: " + e);
            }
        }

        //connecting
        debug.log("Connecting", inst.nodes.length, "Nodes...");
        for(const node of inst.nodes){
            for(const input of node.nodeData.inputs){
                if(input.connectedToId === 0) continue;

                const targetNode = inst.nodes.find(n => n.nodeData.outputs.some(o => o.uuid === input.connectedToId));
                //debug.log("targetNode", targetNode ? "" : "not", "found!");

                if(targetNode){
                    const output = targetNode.nodeData.outputs.find(o => o.uuid === input.connectedToId);
                    if(output) LBNode.ConnectNodes(output, input);
                }
            }
        }
    }
}
