const minify = require("uglify-es").minify;
const fs = require("fs");

let minifyFile = (id, reserved, globals) => {
    let log = (name, file) => {
        let size = fs.statSync(file).size;
        console.log(name+": "+size+"b, "+(Math.ceil(1000*size/baseSize)/10)+"%");
    };
    reserved = reserved?reserved:[];
    let min = fs.readFileSync("./src/template.js", {encoding: "utf-8"});
    for (let key in globals) {
        min = min.replace(key, "\""+globals[key]+"\"");
    }
    let len = min.length;
    const config = {
        ecma: 6,
        compress: {
            passes: 1
        },
        mangle: {
            properties: {
                reserved
            }
        },
        output: {
            beautify: false
        }
    };
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
    log(id?id:"base", path);
};
const reserved = ["exports","Template","render"];
const baseSize = fs.statSync("./src/template.js").size;

/**
 * Minifiing files
 */
minifyFile(
    "node",
    reserved,
    {
        "typeof module": "object",
        "typeof module.exports": "object",
        "typeof window": "undefined",
        "typeof self": "undefined",
        "typeof define": "undefined"
    }
);
minifyFile(
    "browser",
    reserved,
    {
        "typeof module": "undefined",
        "typeof define": "undefined",
        "typeof window": "object"
    }
);
minifyFile(
    "amd",
    reserved,
    {
        "typeof module": "undefined",
        "typeof define": "function",
        "define.amd": "1"
    }
);
minifyFile("base", reserved, {});