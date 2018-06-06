const Template = require ( "../src/template" );
const should = require ( "chai" ).should ();
const expect = require ( "chai" ).expect;
const number = 1000;
const code = {
    output: "{{title}}",
    condition: "{{%if title%}}{{title}}{{%end%}}",
    list: "{{%each list%}}{{_list.value}}{{%end%}}",
    complex: "<h1>{{title}}</h1><ul>{{%each list%}}<li>hi {{_list.value}}{{%if _list.even%}}?{{%end%}}</li>{{%end%}}</ul><p>We win, {{name}}!"
};
const values = {
    title: "An Example",
    list: [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "1A",
        "B2",
        "3C",
        "D4",
        "5E",
        "F6",
        "7G",
        "H8"
    ],
    name: "Tester"
};
var data = {};
function duration(start, end) {
    return end.getTime()-start.getTime();
}
describe ( "performance", ( ) => {
    after(() => {
        console.log(JSON.stringify(data));
    });
    for (let key in code) {
        data[key] = {};
        it ( key+": should render uncached templates", () => {
            let tStart = new Date();
            let cases = new Array(number);
            for (let i=0; i < number; i++) {
                let start = new Date();
                ((new Template(code[key])).render(values)).should.not.equal("");
                cases[i] = duration(start, new Date());
            }
            data[key].uncached = {
                avg: (cases.reduce((a, b) => a+b, 0)/number),
                num: number,
                dur: cases.reduce((a, b) => a+b, 0),
                max: Math.max (...cases),
                min: Math.min (...cases),
                total: duration(tStart, new Date())
            };
        });
        it ( key+": should render cached templates", () => {
            let tStart = new Date();
            let cases = new Array(number);
            let template = new Template(code[key]);
            for (let i=0; i < number; i++) {
                let start = new Date();
                (template.render(values)).should.not.equal("");
                cases[i] = duration(start, new Date());
            }
            data[key].cached = {
                avg: (cases.reduce((a, b) => a+b, 0)/number),
                num: number,
                dur: cases.reduce((a, b) => a+b, 0),
                max: Math.max (...cases),
                min: Math.min (...cases),
                total: duration(tStart, new Date())
            };
        });
    }
});