class TemplateTag {
    render(values) {
        throw new Error("The child class has to implement this!");
    }
}
class ConditionTag extends TemplateTag {
    constructor(name, body)
    {
        super();
        this.body = body;
        this.name = name;
    }
    render(values)
    {
        if (!values[this.name]) {
            return "";
        }
        if (!values[this.name]) {
            return "";
        }
        return this.body.render(values);
    }
}
class EachTag extends TemplateTag {
    constructor(list, body)
    {
        super();
        this.body = body;
        this.list = list;
        this.key = list+"_key";
        this.value = list+"_value";
        this.even = list+"_even";
        this.pos = list+"_pos";
    }
    render(values)
    {
        if (!values[this.list]) {
            return "";
        }
        if (typeof values[this.list] !== "object") {
            return "";
        }
        let list = values[this.list];
        let out = "";
        let keys = Array.isArray(list)?list.keys():Object.keys(list);
        let pos = 0;
        for (let key of keys) {
            let options = JSON.parse(JSON.stringify(values));
            options[this.key] = key;
            options[this.value] = list[key];
            options[this.even] = !(pos%2);
            options[this.pos] = pos;
            out += this.body.render(options);
            pos++;
        }
        return out;
    }
}
class BodyTag extends TemplateTag {
    constructor(content) {
        super();
        this.content = typeof content === "string"?content:"";
    }
    escape(unsafe) {
        return (unsafe+"").replace(/[&<""]/g, function(m) {
          switch (m) {
            case "&":
              return "&amp;";
            case "<":
              return "&lt;";
            case "\"":
              return "&quot;";
            default:
              return "&#039;";
          }
        });
      };
    render(values) {
        return this.replace(this.content, values, "");
    }
    replace(content, values, prefix) {
        for(let key in values) {
            if(typeof values[key] === "object") {
                content = this.replace(content, values[key], prefix+key+".");
            } else {
                content = content.replace(
                    new RegExp("{{"+prefix+key+"}}", "g"),
                    this.escape(values[key])
                );
            }
        }
        return content;
    }
}
class Template extends TemplateTag {
    /**
     * @param {String} code
     * @return {Template}
     */
    constructor(code) {
        super();
        this.parts = [];
        let pos = 0;
        var findEnd = function (code, pos) {
            let pos2 = pos;
            let ins = 1;
            while((pos = code.indexOf("{{%", pos2)) > -1) {
                pos2 = code.indexOf("%}}", pos);
                var def = (code.substring(pos+3, pos2)).split(" ");
                pos2 += 3;
                if (def[0] === "each" || def[0] === "if") {
                    ins++;
                } else if (def[0] === "end") {
                    ins--;
                } else {
                    throw new Error("Token "+def[0]+" is unknown.");
                }
                if (ins === 0) {
                    return pos;
                }
            }
            throw new Error("can't find end.");
        };
        while((pos = code.indexOf("{{%")) > -1) {
            if(pos > 0) {
                this.parts.push(new BodyTag(code.substring(0, pos)));
            }
            code = code.substring(pos+3);
            let pos2 = code.indexOf("%}}");
            let def = (code.substring(0, pos2)).split(" ");
            let pos3 = findEnd(code, pos2+3);
            let body = new Template(code.substring(pos2+3, pos3));
            code = code.substring(pos3+9);
            if (def[0] === "each") {
                this.parts.push(new EachTag(def[1], body));
            } else if (def[0] === "if") {
                this.parts.push(new ConditionTag(def[1], body));
            } else {
                throw new Error("Token "+def[0]+" is unknown.");
            }
        }
        this.parts.push(new BodyTag(code));
    }
    render(values) {
        let content = "";
        for(let pos = 0;pos < this.parts.length;pos++) {
            content += this.parts[pos].render(values);
        }
        return content;
    }
}