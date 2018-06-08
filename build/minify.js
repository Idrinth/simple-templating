const minify = require("uglify-es").minify;
const fs = require("fs");

const baseSize = fs.statSync("./src/template.js").size;
const config = {
    ecma: 6,
    compress: {
        passes: 1
    },
    mangle: {
        properties: {
            reserved: ["exports", "Template", "render"]
        }
    },
    output: {
        beautify: false
    }
};

((sets) => {
    /**
     * @param {string} id
     * @param {string} file
     * @return {void}
     */
    const log = (id, file) => {
        let size = fs.statSync(file).size;
        console.log(id+": "+size+"b, "+(Math.ceil(1000*size/baseSize)/10)+"%");
    };
    /**
     * @param {string} id
     * @param {type} reserved
     * @param {type} globals
     * @return {undefined}
     */
    const minifyFile = (id, globals) => {
        let min = fs.readFileSync("./src/template.js", {encoding: "utf-8"});
        for (let key in globals) {
            min = min.replace(new RegExp(key, 'g'), "\""+globals[key]+"\"");
        }
        let len = min.length;
        do {
            len = min.length;
            min = minify(
                min
                    .replace(/(case([^:'"]|"[^"]"|'[^']')+?:)+default:/, "default:")
                    .replace(/void 0!==(\"[^\"]*\"|'[^']*'|{.*?}|\[.*?\])\?/, "true?"),
                config
            )
            .code;
        } while (len !== min.length);
        let path = "./min/"+id+".min.js";
        fs.writeFileSync(path, min, {encoding: "utf-8"});
        log(id, path);
    };
    /**
     * Minifiing files
     */
    for (let type in sets) {
        minifyFile(type, sets[type]);
    }
})({
    "node": {
        "typeof module\\.exports": "object",
        "typeof module": "object",
        "typeof window": "undefined",
        "typeof self": "object",
        "typeof define": "undefined"
    },
    "browser": {
        "typeof module": "undefined",
        "typeof define": "undefined",
        "typeof window": "object"
    },
    "amd": {
        "typeof module": "undefined",
        "typeof define": "function",
        "define\\.amd": "1"
    },
    "base": {}
});