class Color{
    r: number;
    g: number;
    b: number;
    a: number;

    constructor(r: number = 0, g: number = 0, b: number = 0, a: number = 1){
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    toRgbaString(): string{ return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`; }
    fromRgbaString(rgba: string): Color{
        const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/);
        if(!match) return new Color();

        this.r = parseInt(match[1]);
        this.g = parseInt(match[2]);
        this.b = parseInt(match[3]);
        this.a = match[4] !== undefined ? parseFloat(match[4]) : 1;

        return this;
    }
    toHexString(): string{
        const rHex = this.r.toString(16).padStart(2, '0');
        const gHex = this.g.toString(16).padStart(2, '0');
        const bHex = this.b.toString(16).padStart(2, '0');
        return `#${rHex}${gHex}${bHex}`;
    }
    fromHexString(hex: string): Color{
        if(hex.startsWith('#')) hex = hex.slice(1);
        if(hex.length !== 6) throw new Error("Invalid hex color string");
        this.r = parseInt(hex.slice(0, 2), 16);
        this.g = parseInt(hex.slice(2, 4), 16);
        this.b = parseInt(hex.slice(4, 6), 16);
        return this;
    }
    static fromHexString(hex: string): Color{
        if(hex.startsWith('#')) hex = hex.slice(1);
        if(hex.length !== 6) throw new Error("Invalid hex color string");
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return new Color(r, g, b, 1);
    }
    static fromRgbaString(rgba: string): Color{
        const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/);
        if(!match) return new Color();

        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        const a = match[4] !== undefined ? parseFloat(match[4]) : 1;

        return new Color(r, g, b, a);
    }
    static darken(amount: number, col: Color | string){
        const base: Color = typeof col === "string" ? Color.fromRgbaString(col) : col;
        base.r -= amount;
        base.g -= amount;
        base.b -= amount;

        base.r = Math.min(Math.max(base.r, 0), 255);
        base.g = Math.min(Math.max(base.g, 0), 255);
        base.b = Math.min(Math.max(base.b, 0), 255);
        return base;
    }

    darken(amount: number): Color{
        this.r -= amount;
        this.g -= amount;
        this.b -= amount;
        this.r = Math.min(Math.max(this.r, 0), 255);
        this.g = Math.min(Math.max(this.g, 0), 255);
        this.b = Math.min(Math.max(this.b, 0), 255);
        return this;
    }

    toJson(): object{
        return { r: this.r, g: this.g, b: this.b, a: this.a };
    }
    fromJson(json: any): Color{
        this.r = json.r ?? 0;
        this.g = json.g ?? 0;
        this.b = json.b ?? 0;
        this.a = json.a ?? 1;
        return this;
    }
    static fromJson(json: any): Color{
        return new Color(json.r, json.g, json.b, json.a);
    }

    clone(): Color{ return new Color(this.r, this.g, this.b, this.a); }
}
