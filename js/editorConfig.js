class LineBloxConfig{
    /** The X and Y offsets for the workspace. */
    offsets = {
        /** @type {number} The x-offset the canvas should have (to put your UI on) */
        left: 0,
        /** @type {number} The x-offset the canvas should have (to put your UI on) */
        right: 0,
        /** @type {number} The y-offset the canvas should have (to put your UI on) */
        top: 0
    };

    /** The toolbox-settings */
    toolbox = {
        /** @type {Array} The nodes in the toolbox */
        tbNodes: [],
        /** @type {number} The width of the toolbox (> 100 for no toolbox: contextmenu instead) */
        toolboxW: 0
    };

    plugins = {
        /** @type {boolean} If plugins should be enabled (default: false) */
        enable: false,
        /** @type {boolean} Where the plugins can be found (used for lookup when projects are loaded with plugins) */
        pluginPath: ""
    };
}
