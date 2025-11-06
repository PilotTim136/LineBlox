/**
 * @param {LineBlox} lb
 */
LineBlox.prototype.drawScrollbar = (lb) => {
    const canvas = lb.canvas;
    const ctx = lb.ctx;

    const width = 10;
    const subWidth = (width * 2);
    const minWidth = 10;
    const grip = 5;

    //X
    const XminX = 0 - lb.scrollX + lb.scrollBarX;
    const XmaxY = width;
    const XminY = canvas.height - XmaxY - 2;
    let Xwidth = canvas.width - (lb.scrollX / lb.scrollIntensityX) - subWidth;
    if (Xwidth < minWidth) {
        lb.scrollIntensityX = lb.scrollX / (canvas.width - subWidth - minWidth);
        Xwidth = minWidth;
    }

    ctx.fillStyle = "gray";
    ctx.fillRect(XminX + lb.scrollX, XminY, Xwidth, XmaxY);
    ctx.strokeStyle = "rgba(0, 0, 0, 1)";
    ctx.lineWidth = 2;
    ctx.strokeRect(XminX + lb.scrollX, XminY, Xwidth, XmaxY);

    if(lb.mouseDown && !lb.dragging){
        if(lb.mouseX >= XminX + lb.scrollX - grip && lb.mouseX <= XminX + lb.scrollX + Xwidth + grip &&
            lb.mouseY >= XminY && lb.mouseY <= XminY + XmaxY){
            lb.draggingScrollbarX = true;
            lb.scrollBarXOffset = lb.mouseX - (XminX + lb.scrollX);
        }
    }
    if (lb.dragging && lb.draggingScrollbarX) {
        const mx = lb.mouseX;
        lb.scrollBarX = mx - lb.scrollBarXOffset;
        if(lb.scrollBarX < 0)
            lb.scrollBarX = 0;
        else if(lb.scrollBarX + Xwidth > canvas.width - subWidth)
            lb.scrollBarX = canvas.width - Xwidth - subWidth;
    }

    //Y
    const YminX = width;
    const YbarX = canvas.width - YminX - 2;
    let Yheight = canvas.height - (lb.scrollY / lb.scrollIntensityY) - subWidth;
    if(Yheight < minWidth){
        lb.scrollIntensityY = lb.scrollY / (canvas.height - subWidth - minWidth);
        Yheight = minWidth;
    }

    ctx.fillRect(YbarX, lb.scrollBarY, YminX, Yheight);
    ctx.strokeRect(YbarX, lb.scrollBarY, YminX, Yheight);

    if(lb.mouseDown && !lb.dragging){
        if(lb.mouseX >= YbarX - grip && lb.mouseX <= YbarX + YminX + grip &&
            lb.mouseY >= lb.scrollBarY && lb.mouseY <= lb.scrollBarY + Yheight){
            lb.draggingScrollbarY = true;
            lb.scrollBarYOffset = lb.mouseY - lb.scrollBarY;
        }
    }

    if(lb.dragging && lb.draggingScrollbarY){
        const my = lb.mouseY;
        lb.scrollBarY = my - lb.scrollBarYOffset;
        if(lb.scrollBarY < 0)
            lb.scrollBarY = 0;
        else if(lb.scrollBarY + Yheight > canvas.height - subWidth)
            lb.scrollBarY = canvas.height - Yheight - subWidth;
    }
}
