/** 
 * @typedef {"Any" | "String" | "Number" | "Boolean" | "Connect"} NodeIOType
 */

class NodeConnection{
    //the only rason they're not private
    //the sake of my sanity
    //update: i forgot why this is here
    from;
    to;
    fromName;
    toName;

    /**
     * @param {BNode} from 
     * @param {BNode} to 
     * @param {string} fromName 
     * @param {string} toName 
     */
    constructor(from, to, fromName, toName){
        this.from = from;
        this.to = to;
        this.fromName = fromName;
        this.toName = toName;
    }
}

class NodeIOHandle{
    /** @type {string} Name for the in-/output */
    name = "";
    /** @type {NodeIOType} Type for the node in-/output - defined as string - will define what in-/output will be */
    type = "";
    /** @type {NodeConnection} Connection for node point */
    connection = null;
    /** @type {Boolean} integratedInput Wether or not the given input should have an integrated editable UI for the element */
    integratedInput = false;
    /** @type {Boolean} hideInput Hides the input when it's loaded as node */
    hideInput = false;
    /** @type {Array<string> | undefined} Can have strings as array for dropdowns instead of text */
    values = undefined;

    inputWidth = 0;
    ignoreText = false;

    isMutated = false;

    value = "";
    display = "";
    dName = "";

    /**
     * @param {string} name Name for the in-/output
     * @param {Array<string> | undefined} values Can have strings as array for dropdowns instead of text
     * @param {NodeIOType} type Type for the node in-/output - defined as string - will define what in-/output will be (default: "Any")
     * @param {Boolean} integratedInput Wether or not the given input should have an integrated editable UI for the element (default: false)
     * @param {Boolean} hideInput Hides the input when it's loaded as node
     */
    constructor(name, dName = null, code = undefined, values = undefined, display = "", type = "Any", integratedInput = false, hideInput = false,
        inputWidth = 0, ignoreText = false){
        this.name = name;
        this.dName = !dName ? name : dName;
        this.values = values;
        this.type = type;
        this.integratedInput = integratedInput;
        this.hideInput = hideInput;
        this.display = display;
        this.inputWidth = inputWidth;
        this.ignoreText = ignoreText;
        if(code != undefined && code != null){
            this.code = code;
        }
    }
}

class ColUtil{
    static parseColor(col) {
        if (col.startsWith("#")) {
            const c = col.slice(1);
            const num = parseInt(c, 16);
            return {
                r: (num >> 16) & 0xFF,
                g: (num >> 8) & 0xFF,
                b: num & 0xFF
            };
        }
        if (col.startsWith("rgb")) {
            const nums = col.match(/\d+/g).map(Number);
            return { r: nums[0], g: nums[1], b: nums[2] };
        }
        throw new Error("Unknown color format: " + col);
    }

    static toHex({r, g, b}) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    static toRGB({r, g, b}) {
        return `rgb(${r},${g},${b})`;
    }

    static darkenColor(col, amt = 40, output = "hex") {
        const {r, g, b} = ColUtil.parseColor(col);
        const nr = Math.max(0, r - amt);
        const ng = Math.max(0, g - amt);
        const nb = Math.max(0, b - amt);
        if (output === "rgb") return ColUtil.toRGB({r: nr, g: ng, b: nb});
        return ColUtil.toHex({r: nr, g: ng, b: nb});
    }
}
