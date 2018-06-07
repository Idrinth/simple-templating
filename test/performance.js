const Template = require ( "../src/template" );
const should = require ( "chai" ).should ();
const expect = require ( "chai" ).expect;
const pretty = require ( "prettyjson" );
const number = 10000;
const code = {
    output: [
        "{{title}}",
        60
    ],
    output_child: [
        "{{list.1}}",
        60
    ],
    output_grandchild: [
        "{{ch.ch.ch}}",
        50
    ],
    output_grandchild_tripple: [
        "{{ch.ch.ch}}{{ch.ch.ch}}{{ch.ch.ch}}",
        50
    ],
    condition: [
        "{%if title%}{{title}}{%end%}",
        60
    ],
    list: [
        "{%each list%}{{_list.value}}{%end%}",
        45
    ],
    list_object: [
        "{%each ch%}{{_ch.value.ch}}{%end%}",
        45
    ],
    list_object_list: [
        "{%each ch%}{{_ch.key}}\n{%each _ch.value%}  {{__ch.key}}:{{__ch.value}}\n{%end%}{%end%}",
        25
    ],
    complex: [
        "<h1>{{title}}</h1>"
            +"<ul>{%each list%}"
            +"<li>hi {{_list.value}}{%if _list.even%}?{%end%}{%if !_list.even%}!{%end%}</li>"
            +"{%end%}</ul><p>We win, {{name}}!",
        25
    ],
    complex_duplicated: [
        "<h1>{{title}}</h1>"
            +"<ul>{%each list%}"
            +"<li>hi {{_list.value}}{%if _list.even%}?{%end%}{%if !_list.even%}!{%end%}</li>"
            +"{%end%}</ul>"
            +"<ul>{%each list%}"
            +"<li>hi {{_list.value}}{%if _list.even%}?{%end%}{%if !_list.even%}!{%end%}</li>"
            +"{%end%}</ul>"
            +"<ul>{%each ch%}"
            +"<li><ul>{%each _ch.value%}"
            +"<li>hi {{__ch.value}}{{name}}{%if __ch.even%}?{%end%}{%if !_ch.even%}!{%end%}</li>"
            +"{%end%}</li>"
            +"{%end%}</ul>"
            +"<p>We win, {{name}}!",
        10
    ]
};
const values = {
    title: "An Example",
    ch: {
        ch: {
            ch: "1"
        },
        dh: {
            ch: "2"
        },
        eh: {
            ch: "3"
        }
    },
    list: [
        "A",
        "B",
        "C"
    ],
    name: "Tester"
};
var data = {};
function duration(start, end) {
    return end.getTime() - start.getTime();
}
function makeSet(start, end, cases)
{
    let dur = cases.reduce((a, b) => a+b, 0);
    let data = {
        avg: (dur/number),
        num: number,
        dur,
        max: Math.max (...cases),
        min: Math.min (...cases),
        total: duration(start, end)
    };
    data.ops = Math.floor(1000/data.avg);
    return data;
}
describe ( "performance", ( ) => {
    after(() => {
        console.log(pretty.render(data));
    });
    for (let key in code) {
        describe ( key, () => {
            data[key] = {};
            it ( "should render uncached templates", () => {
                let tStart = new Date();
                let cases = new Array(number);
                for (let i=0; i < number; i++) {
                    let start = new Date();
                    ((new Template(code[key][0])).render(values)).should.not.equal("");
                    cases[i] = duration(start, new Date());
                }
                data[key].uncached = makeSet(tStart, new Date(), cases);
            });
            it ("uncached should have at least "+code[key][1]+"k ops/s", () => {
                data[key].uncached.ops.should.be.above (code[key][1]*1000-1);
            });
            it ( "should render cached templates", () => {
                let tStart = new Date();
                let cases = new Array(number);
                let template = new Template(code[key][0]);
                for (let i=0; i < number; i++) {
                    let start = new Date();
                    (template.render(values)).should.not.equal("");
                    cases[i] = duration(start, new Date());
                }
                data[key].cached = makeSet(tStart, new Date(), cases);
            });
            it ("cached should be at least 25% faster than uncached", () => {
                data[key].cached.ops.should.be.above (data[key].uncached.ops*1.25);
            });
        });
    }
});