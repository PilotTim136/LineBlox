function updateContentBounds(lb, padding = 200) {
    const canvas = lb.canvas;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of (lb.nodes || [])) {
        if (!n) continue;
        minX = Math.min(minX, n.x);
        minY = Math.min(minY, n.y);
        maxX = Math.max(maxX, n.x + (n.width || 0));
        maxY = Math.max(maxY, n.y + (n.height || 0));
    }

    if (!isFinite(minX)) minX = 0;
    if (!isFinite(minY)) minY = 0;
    if (!isFinite(maxX)) maxX = canvas.width;
    if (!isFinite(maxY)) maxY = canvas.height;

    lb.contentMinX = minX - padding;
    lb.contentMinY = minY - padding;
    lb.contentWidth = Math.max(1, (maxX + padding) - lb.contentMinX);
    lb.contentHeight = Math.max(1, (maxY + padding) - lb.contentMinY);

    lb.scrollX = Math.max(0, Math.min(lb.scrollX || 0, Math.max(0, lb.contentWidth - canvas.width)));
    lb.scrollY = Math.max(0, Math.min(lb.scrollY || 0, Math.max(0, lb.contentHeight - canvas.height)));
}
/**
 * @param {LineBlox} lb
 */
LineBlox.prototype.drawToolbox = function(lb){
    const ctx = lb.toolbox.ctx;
    const x = lb.toolbox.size.x;
    const sel = lb.toolbox.selected;

    const mouse = lb.toolbox.mousePos;

    ctx.clearRect(0, 0, lb.toolbox.canvas.width, lb.toolbox.canvas.height);

    const lOffset = 6;
    const fontSize = 15;

    ctx.font = fontSize + "px Sans-Serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    let i = 0;

    let largestW = 0;
    //get width
    for(const cat of BNodes.toolbox){
        const s = ctx.measureText(cat.category).width + fontSize;
        largestW = s > largestW ? s : largestW;
    }

    //display text
    let cy = 0;
    for(const cat of BNodes.toolbox){
        ctx.fillStyle = cat.color;
        let paint = false;

        if(mouse.x > lb.xOffset && mouse.x < largestW &&
            mouse.y > cy && mouse.y < cy + fontSize){
                if(lb.toolbox.clickedFrame) lb.toolbox.selected = i;
                paint = true;
            }
        if(i == sel) paint = true;

        if(paint) ctx.fillRect(0, cy + 2, largestW, fontSize);
        else ctx.fillRect(0, cy + 2, lOffset - 2, fontSize);

        if(paint) ctx.fillStyle = "white";
        ctx.fillText(cat.category, lOffset, cy + fontSize - 4, largestW);

        cy += fontSize + 5;
        i++;
    }

    //draw boundaries
    //category -> tools
    ctx.fillStyle = "gray";
    ctx.fillRect(largestW, 0, 3, lb.toolbox.canvas.height);

    //tools -> workspace
    ctx.fillRect(x - 3, 0, 3, lb.toolbox.canvas.height);


    //place nodes
    const blockToCategoryIndex = {};
    BNodes.toolbox.forEach((cat, idx) => {
        for (const block of cat.blocks) {
            if (!blockToCategoryIndex[block]) blockToCategoryIndex[block] = [];
            blockToCategoryIndex[block].push(idx);
        }
    });

    const canvas = lb.toolbox.canvas;
    cy = 10;    
    let maxY = 0;
    for(let node of BNodes.blocks){
        const categoryIndices = blockToCategoryIndex[node.internalID] || [];
        if(!categoryIndices.includes(sel)) continue;

        h = LineBlox.drawDragNode(ctx, node, largestW, cy - lb.toolbox.scrollBarY, lb, 15, x - largestW + 3, true, x);
        const hh = (cy + h) - canvas.height;
        maxY = hh > maxY ? hh : maxY;
        w = node.width;
        
        let _x = largestW + 10 + (x - largestW - 20 - w) / 2;

        const mx = lb.toolbox.mousePos.x;
        const my = lb.toolbox.mousePos.y;
        if(lb.toolbox.clickedFrame && mx > _x && mx < _x + w &&
            my > cy && my < cy + h){
                lb.toolbox.draggingNodeID = node;
            }
        cy += h + 10;
    }
    lb.toolbox.scrollY = maxY;

    
    const YminX = 6;
    const YbarX = x - YminX - 2;
    const Yheight = canvas.height - lb.toolbox.scrollY - 0;

    ctx.fillStyle = "gray";
    ctx.fillRect(YbarX, lb.toolbox.scrollBarY, YminX, Yheight);

    if((lb.toolbox.clickedFrame || lb.toolbox.draggingScrollbarY) && !lb.toolbox.draggingNodeID){
        if(lb.toolbox.mousePos.x >= YbarX && lb.toolbox.mousePos.x <= canvas.width &&
            lb.toolbox.mousePos.y >= lb.toolbox.scrollBarY && lb.toolbox.mousePos.y <= lb.toolbox.scrollBarY + Yheight){
            lb.toolbox.draggingScrollbarY = true;
            lb.toolbox.scrollBarYOffset = lb.toolbox.mousePos.y - lb.toolbox.scrollBarY;
        }
    }

    if(!lb.toolbox.dragging && lb.toolbox.draggingScrollbarY){
        const my = lb.toolbox.mousePos.y;
        lb.toolbox.scrollBarY = my - lb.toolbox.scrollBarYOffset;
        if(lb.toolbox.scrollBarY < 0)
            lb.toolbox.scrollBarY = 0;
        else if(lb.toolbox.scrollBarY + Yheight > canvas.height - 0)
            lb.toolbox.scrollBarY = canvas.height - Yheight - 0;
    }
}
