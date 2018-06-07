const should = require ( "chai" ).should ();
const expect = require ( "chai" ).expect;
const number = 5000;
const factor = (() => {
    let start = new Date();
    let num = 0;
    for (let i = 0; i < number; i++) {
        num += "my Name is not A bitName, is it?".match (/a+/ig) + Math.random ();
    }
    return number/(new Date()-start)*0.7;
})();
const code = {
    outputSimple: [
        "{{title}}",
        125
    ],
    outputChild: [
        "{{list.1}}",
        120
    ],
    outputGrandchild: [
        "{{ch.ch.ch}}",
        115
    ],
    outputGrandchildTripple: [
        "{{ch.ch.ch}}{{ch.ch.ch}}{{ch.ch.ch}}",
        100
    ],
    condition: [
        "{%if title%}{{title}}{%end%}",
        120
    ],
    listArray: [
        "{%each list%}{{_list.value}}{%end%}",
        80
    ],
    listObject: [
        "{%each ch%}{{_ch.value.ch}}{%end%}",
        80
    ],
    listObjectList: [
        "{%each ch%}{{_ch.key}}\n{%each _ch.value%}  {{__ch.key}}:{{__ch.value}}\n{%end%}{%end%}",
        45
    ],
    complex: [
        "<h1>{{title}}</h1>"
            +"<ul>{%each list%}"
            +"<li>hi {{_list.value}}{%if _list.even%}?{%end%}{%if !_list.even%}!{%end%}</li>"
            +"{%end%}</ul><p>We win, {{name}}!",
        40
    ],
    complexDuplicated: [
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
        20
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
function duration(start, end) {
    return end.getTime() - start.getTime();
}
function calcOps(cases)
{
    return Math.floor(number*1000/cases.reduce((a, b) => a+b, 0));
}
for (let version of ["", ".min"]) {
    const Template = require ( "../src/template"+version );
    describe ( "performance"+version, ( ) => {
        for (let key in code) {
            describe ( key, () => {
                let data = {};
                let ops = {
                    uncached: Math.floor (code[key][1]*factor/100)/10,
                    cached: Math.floor (code[key][1]*factor/100*1.25)/10
                };
                it ( "should render uncached templates", () => {
                    let cases = new Array(number);
                    for (let i=0; i < number; i++) {
                        let start = new Date();
                        ((new Template(code[key][0])).render(values)).should.not.equal("");
                        cases[i] = duration(start, new Date());
                    }
                    data.uncached = calcOps(cases);
                });
                it ("uncached should have at least "+ops.uncached+"k ops/s", () => {
                    data.uncached.should.be.above (ops.uncached*1000-1);
                });
                it ( "should render cached templates", () => {
                    let cases = new Array(number);
                    let template = new Template(code[key][0]);
                    for (let i=0; i < number; i++) {
                        let start = new Date();
                        (template.render(values)).should.not.equal("");
                        cases[i] = duration(start, new Date());
                    }
                    data.cached = calcOps(cases);
                });
                it ("cached should have at least "+ops.cached+"k ops/s", () => {
                    data.cached.should.be.above (ops.cached*1000-1);
                });
                it ("cached should be at least 10% faster than uncached", () => {
                    data.cached.should.be.above (data.uncached*1.1);
                });
            });
        }
    }).timeout(10000);
}