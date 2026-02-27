//this will draw the grid-background for the canvas
class LB_Background{
    static DrawBG(data: LB_CanvasData, drawGrid: boolean = false){
        const ctx = data.context;
        const zoom = data.zoom;
        const scrollPos = data.scrollPos;

        ctx.setTransform(zoom, 0, 0, zoom, -scrollPos.x * zoom, -scrollPos.y * zoom);

        const width = ctx.canvas.width / zoom;
        const height = ctx.canvas.height / zoom;
        ctx.fillStyle = "#303030";
        ctx.fillRect(scrollPos.x, scrollPos.y, width + scrollPos.x, height + scrollPos.y);

        if(!drawGrid) return;   

        const gridSize = 25;
        ctx.strokeStyle = "#5a5a5a";
        ctx.lineWidth = 1 / zoom;

        const offsetX = scrollPos.x % gridSize;
        const offsetY = scrollPos.y % gridSize;

        for(let x = -offsetX; x <= width; x += gridSize){
            ctx.beginPath();
            //ctx.moveTo(x, 0);
            //ctx.lineTo(x, height);
            ctx.moveTo(x + scrollPos.x, scrollPos.y);
            ctx.lineTo(x + scrollPos.x, height + scrollPos.y);
            ctx.stroke();
        }
        for(let y = -offsetY; y <= height; y += gridSize){
            ctx.beginPath();
            //ctx.moveTo(0, y);
            //ctx.lineTo(width, y);
            ctx.moveTo(scrollPos.x, y + scrollPos.y);
            ctx.lineTo(width + scrollPos.x, y + scrollPos.y);
            ctx.stroke();
        }
    }

    //DEVELOPER'S NOTE: "maxScroll" is currently used for limiting the max scrolling area, but scales with the zoom & max x/y values of placed blocks.
    static DrawScroll(data: LB_CanvasData, hideHorizontal = false, hideVertical = false){
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

        if(!hideHorizontal){
            ctx.fillStyle = "#444";
            ctx.fillRect(
                scrollPos.x,
                scrollPos.y + viewH - barSize,
                viewW,
                barSize
            );

            ctx.fillStyle = "#888";
            ctx.fillRect(
                scrollPos.x + thumbX,
                scrollPos.y + viewH - barSize,
                finalThumbW,
                barSize
            );
        }

        if(!hideVertical){
            ctx.fillStyle = "#444";
            ctx.fillRect(
                scrollPos.x + viewW - barSize,
                scrollPos.y,
                barSize,
                viewH
            );

            ctx.fillStyle = "#888";
            ctx.fillRect(
                scrollPos.x + viewW - barSize,
                scrollPos.y + thumbY,
                barSize,
                finalThumbH
            );
        }
    }

    static LogicScroll(data: LB_CanvasData, type: "down" | "move" | "up", e?: MouseEvent, ignoreHorizontal = false, ignoreVertical = false){
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

        if(type === "down" && e){
            const mx = e.offsetX / zoom;
            const my = e.offsetY / zoom;

            //horizontal
            if(!ignoreHorizontal){
                if(my >= viewH - barSizePx / zoom &&
                    mx >= thumbX && mx <= thumbX + thumbW){
                    state.isDraggingH = true;
                    state.dragStart.x = mx;
                    state.scrollStart.x = data.scrollPos.x;
                }
            }

            //vertical
            if(!ignoreVertical){
                if(mx >= viewW - barSizePx / zoom &&
                my >= thumbY && my <= thumbY + thumbH){
                    state.isDraggingV = true;
                    state.dragStart.y = my;
                    state.scrollStart.y = data.scrollPos.y;
                }
            }
        }

        if(type === "move" && e){
            const mx = e.offsetX / zoom;
            const my = e.offsetY / zoom;

            if(state.isDraggingH){
                const dx = (mx - state.dragStart.x) / (viewW - thumbW) * data.maxScroll.x;
                data.scrollPos.x = Math.max(0, Math.min(
                    data.maxScroll.x,
                    state.scrollStart.x + dx
                ));
            }

            if(state.isDraggingV){
                const dy = (my - state.dragStart.y) / (viewH - thumbH) * data.maxScroll.y;
                data.scrollPos.y = Math.max(0, Math.min(
                    data.maxScroll.y,
                    state.scrollStart.y + dy
                ));
            }
        }

        if(type === "up"){
            state.isDraggingH = false;
            state.isDraggingV = false;
        }
    }
}
