//FROM zInstance.ts -> resolveOutput in GenerateCode (<bkup01>)
/*if(!visitedCode.has(nodeUuid)){
                        debug.log(`[resolveOutput] generating .code() for node: ${node.nodeData.uniqueId} (uuid:${nodeUuid})`);
                        //visitedCode.add(nodeUuid);

                        let nodeResult = "";

                        try{
                            debug.log(`[resolveOutput] calling output.code() of ${node.nodeData.uniqueId}`);

                            if(io.code){
                                nodeResult = io.code?.({
                                    input: resolveInputs(node, visitedCode, visitedPath)
                                }) ?? "";
                            }else if(!visitedCode.has(nodeUuid)){
                                debug.log(`[resolveOutput] generating .code() for node: ${node.nodeData.uniqueId} (uuid:${nodeUuid})`);
                                nodeResult = node.nodeData.code?.({
                                    input: resolveInputs(node, visitedCode, visitedPath),
                                    output: resolveOutputs(node, visitedCode, visitedPath)
                                }) ?? "";
                                visitedCode.add(nodeUuid);
                            }else{
                                debug.warn(`[resolveOutput] node ${node.nodeData.uniqueId} (uuid:${nodeUuid}) already generated (visitedCode) — skipping .code()`);
                            }
                            
                            debug.log(`[resolveOutput] nodeResult from ${node.nodeData.uniqueId}:`, nodeResult);
                        }catch(err){
                            console.error(`[resolveOutput] EXCEPTION calling code() on ${node.nodeData.uniqueId}:`, err);
                        }

                        code += nodeResult;
                        visitedPath.delete(nodeUuid);
                    }else{
                        debug.warn(`[resolveOutput] node ${node.nodeData.uniqueId} (uuid:${nodeUuid}) already generated (visitedCode) — skipping .code()`);
                    }*/

/*let nodeResult = "";
                    try{
                        if(io.code){
                            // Für Output-Code nur die Inputs auflösen
                            debug.log(`[resolveOutput] calling io.code() of ${node.nodeData.uniqueId}`);
                            const inputValues = resolveInputs(node, visitedCode, visitedPath);
                            const outputValues = resolveOutputs(node, visitedCode, visitedPath);
                            nodeResult = io.code({ input: inputValues, output: outputValues }) ?? "";

                        }else if(!visitedCode.has(nodeUuid)){
                            debug.log(`[resolveOutput] generating node.code() for node: ${node.nodeData.uniqueId} (uuid:${nodeUuid})`);
                            const inputValues = resolveInputs(node, visitedCode, visitedPath);
                            const outputValues = resolveOutputs(node, visitedCode, visitedPath);
                            nodeResult = node.nodeData.code?.({ input: inputValues, output: outputValues }) ?? "";
                            visitedCode.add(nodeUuid); // erst nach node.code()
                        }else{
                            debug.warn(`[resolveOutput] node ${node.nodeData.uniqueId} (uuid:${nodeUuid}) already generated (visitedCode) — skipping node.code()`);
                        }
                    }catch(err){
                        console.error(`[resolveOutput] EXCEPTION calling code() on ${node.nodeData.uniqueId}:`, err);
                    }

                    code += nodeResult;
                    visitedPath.delete(nodeUuid);*/

