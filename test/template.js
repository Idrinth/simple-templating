const define = require("node-requirejs-define");
const runner = require ("./set/template");
const decache = require("decache");

const tempGlobal = (key, value, path, func) => {
    global[key] = value;
    try{
        let ret = require (path);
        func(ret);
    } finally {
        delete global[key];
        decache(path);
    }
};

runner(require ( "../src/template"), "src");
runner(require ( "../min/node.min"), "node");
runner(require ( "../min/base.min"), "min");
tempGlobal(
    "define",
    define,
    "../min/amd.min",
    (ret) => {runner(ret, "amd");}
);
tempGlobal(
    "window",
    {},
    "../min/browser.min",
    (ret) => {
        runner(global.window.Template, "browser.window");
    }
);
tempGlobal(
    "self",
    {},
    "../min/browser.min",
    (ret) => {
        runner(global.self.Template, "browser.self");
    }
);