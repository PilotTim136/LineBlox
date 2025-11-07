class LBPlugin{
    /** @type {(lb: LineBlox) => void | null} Callback when plugin created */
    initFunc = null;
    /** @type {() => void | null} Callback when plugin removed */
    remFunc = null;
    /** @type {string} Name for plugin */
    name = "";
    /** @type {Array<string>} List of plugin names that are dependencies for this plugin */
    dependencies = [];

    /**
     * Will be called internally from plugin-loader when initializing the plugin
     */
    Init(lbInst){
        this.initFunc?.(lbInst);
    }

    /**
     * Will be called internally from plugin-loader when removing the plugin
     */
    Remove(){
        this.remFunc?.();
    }

    /**
     * Creates a new LineBloxPlugin instance. Can contain init and remove callbacks.
     * @param {string} name 
     * @param {Array<string> | null} dependencies List of plugin names that are dependencies for this plugin
     * @param {(lb: LineBlox) => void | null} initFunc Init function. Will contain instance of LineBlox as parameter
     * @param {() => void | null} remFunc 
     */
    constructor(name, dependencies = null, initFunc = null, remFunc = null){
        this.name = name;
        this.dependencies = dependencies ?? [];
        this.initFunc = initFunc;
        this.remFunc = remFunc;
    }
}
