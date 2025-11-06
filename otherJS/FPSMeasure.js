let frames = 0;
let last = performance.now();
const fpsDisplay = document.getElementById("FPS");

function measureFPS(now){
    frames++;
    if(now - last >= 1000){
        fpsDisplay.textContent = "FPS: " + frames;
        frames = 0;
        last = now;
    }

    requestAnimationFrame(measureFPS);
}

requestAnimationFrame(measureFPS);

function stressTest(numNodes = 2000, maxX = 2000, maxY = 2000){
    const nodes = [];

    for(let i = 0; i < numNodes; i++){
        const x = Math.floor(100 + Math.random() * (maxX - 100));
        const y = Math.floor(100 + Math.random() * (maxY - 100));

        const node = {
            name: "TestNode" + i,
            internalName: "test_node_" + i,
            color: `rgba(${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, 1)`,
            width: 100,
            x,
            y,
            alwaysGenerate: false,
            uuid: Date.now() + Math.random(),
            inputs: [
                { name: "in1", type: "Any", value: "", display: "Variable", integrated: false, hideInput: false, values: null, code: null }
            ],
            outputs: [
                { name: "out1", type: "Any", value: "", display: "Variable", integrated: false, values: null, code: null }
            ]
        };

        const inputs = node.inputs.map(h => {
            const n = new NodeIOHandle(h.name, h.code ?? null, h.values, h.display ?? "", h.type ?? "Any", h.integrated ?? false, h.hideInput ?? false);
            n.value = h.value;
            return n;
        });

        const outputs = node.outputs.map(h => {
            const n = new NodeIOHandle(h.name, h.code ?? null, h.values, h.display ?? "", h.type ?? "Any", h.integrated ?? false);
            n.value = h.value;
            return n;
        });

        new BNode(
            node.name,
            node.internalName,
            inputs,
            outputs,
            node.x,
            node.y,
            node.color,
            node.width,
            LBInst,
            {},
            node.alwaysGenerate,
            node.uuid
        );
    }

    return nodes;
}
