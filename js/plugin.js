//TODO: Add more plugin hooks (onNodeCreate, onNodeDelete, onConnect, onDisconnect, etc) (maybe)

class LBPlugin{
    /** @type {(inst: LBPlugin, lb: LineBlox) => void | null} Callback when plugin created */
    initFunc = null;
    /** @type {(inst: LBPlugin) => void | null} Callback when plugin removed */
    remFunc = null;
    /** @type {string} Name for plugin */
    name = "";
    /** @type {string} Unuqie ID for plugin - use filename! */
    uuid = "";
    /** @type {Array<string>} List of plugin names that are dependencies for this plugin */
    dependencies = [];

    /** @type {LineBlox | null} Instance of LineBlox this plugin is added to */
    #inst = null;

    /**
     * Will be called internally from plugin-loader when initializing the plugin
     */
    Init(lbInst){
        this.#inst = lbInst;
        this.initFunc?.(this, lbInst);
    }

    /**
     * Will be called internally from plugin-loader when removing the plugin
     */
    Remove(){
        this.remFunc?.(this);
    }

    /**
     * Adds this plugin to the LineBlox instance (registers it and calls "initFunc")
     */
    AddToWorkspace(){
        BNodes.inst.plugin.addPlugin(this);
    }

    /**
     * This adds a category for the plugin to the toolbox.
     * @param {string | null} name Category name (null for plugin-name)
     * @param {string} color HEX or RGB(a) color for the category
     */
    AddCategory(name, color){
        name = name ?? this.name;
        this.#inst.AddCategoryToToolbox(name, color, null, this.name); 
    }

    /**
     * This will add a node definition for the plugin INCLUDING registering it directly into the toolbox.
     * @param {Object} def Node definition object
     * @param {string | null} category Category name | null for plugin-name
     */
    AddNode(def, category = null){
        this.#inst.DefineNewPluginNode(def, this);
        this.#inst.AddNodeToCategory(category ?? this.name, def.internalID, njsPlugin.name);
    }

    /**
     * Creates a new LineBloxPlugin instance. Can contain init and remove callbacks.
     * @param {string} uuid Unique ID for the plugin - use filename!
     * @param {string} name Name of the plugin
     * @param {Array<string> | null} dependencies List of plugin names that are dependencies for this plugin
     * @param {(lb: LineBlox) => void | null} initFunc Init function. Will contain instance of LineBlox as parameter
     * @param {() => void | null} remFunc 
     */
    constructor(uuid, name, dependencies = null, initFunc = null, remFunc = null){
        this.uuid = uuid;
        this.name = name;
        this.dependencies = dependencies ?? [];
        this.initFunc = initFunc;
        this.remFunc = remFunc;
    }
}
