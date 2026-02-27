//#region DEBUG

let DEBUG = false;

const debug = {
    log: (message?: any, ...optionalParams: any[]) => { if(DEBUG) console.log(message, ...optionalParams); },
    warn: (message?: any, ...optionalParams: any[]) => { if(DEBUG) console.warn(message, ...optionalParams); },
    error: (message?: any, ...optionalParams: any[]) => { if(DEBUG) console.error(message, ...optionalParams); },
    group: (...label: any[]) => { if(DEBUG) console.group(...label); },
    groupEnd: () => { if(DEBUG) console.groupEnd(); }
};

//#endregion

//#region NODE VISIBILITY

class LB_NodeSettings{
    static drawSimple = false;
}

//#endregion
