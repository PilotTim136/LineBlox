//this is generally only for storing 2D vector data, without having to manually write "X, Y, height, width" etc.

class Vector2{
    x: number;
    y: number;
    constructor(x: number = 0, y: number = 0){
        this.x = x;
        this.y = y;
    }

    static #zero: Vector2 = new Vector2();
    static get zero(): Vector2 { return Vector2.#zero; }

    add(v: Vector2): Vector2{ return new Vector2(this.x + v.x, this.y + v.y); }
    subtract(v: Vector2): Vector2{ return new Vector2(this.x - v.x, this.y - v.y); }
    multiply(scalar: number): Vector2{ return new Vector2(this.x * scalar, this.y * scalar); }
    divide(scalar: number): Vector2{ return new Vector2(this.x / scalar, this.y / scalar); }
    equals(v: Vector2): boolean{ return this.x === v.x && this.y === v.y; }

    static Add(v1: Vector2, v2: Vector2): Vector2{ return new Vector2(v1.x + v2.x, v1.y + v2.y); }
    static Subtract(v1: Vector2, v2: Vector2): Vector2{ return new Vector2(v1.x - v2.x, v1.y - v2.y); }
    static Multiply(v: Vector2, scalar: number): Vector2{ return new Vector2(v.x * scalar, v.y * scalar); }
    static Divide(v: Vector2, scalar: number): Vector2{ return new Vector2(v.x / scalar, v.y / scalar); }

    toJson(): object{ return { x: this.x, y: this.y }; }
    fromJson(json: any): Vector2{
        this.x = json.x ?? 0;
        this.y = json.y ?? 0;
        return this;
    }
    static fromJson(json: any): Vector2{ return new Vector2(json.x, json.y); }

    clone(): Vector2{ return new Vector2(this.x, this.y); }
}
