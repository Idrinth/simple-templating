const should = require ( "chai" ).should ();
const expect = require ( "chai" ).expect;

module.exports = function (Template, name) {
    describe ( "@"+name+"|template", () => {
        it ( "should have a Template variable in scope", () => {
            should.exist ( Template );
            describe ( "@"+name+"|template.Template", () => {
                it ( "Template should be a function", () => {
                    Template.should.be.a ( "function" );
                    describe ( "@"+name+"|template.Template()", () => {
                        it ( "should throw if end tag is missing", () => {
                            expect(() => new Template ( "{%if a%}hi world" )).to.throw( "can't find end." );
                        });
                        it ( "should throw if unknown tag is used", () => {
                            expect(() => new Template ( "{%ef a%}hi world{%end%}" )).to.throw( "Token ef is invalid." );
                        });
                        it ( "should return an object", () => {
                            let instance = new Template ( "" );
                            instance.should.be.an ( "object" );
                            describe ( "@"+name+"|template.Template#Instance", () => {
                                it ( "should have a property render", () => {
                                    instance.should.have.property ( "render" );
                                    describe ( "@"+name+"|template.Template#Instance.render()", () => {
                                        it ( "should return expected html(0)", () => {
                                            let instance = new Template ( "<p>{{name}}: {{names.last}}</p>" );
                                            instance.render ( {
                                                name: "A",
                                                names: {
                                                    last: "B"
                                                }
                                            } ).should.equal ( "<p>A: B</p>" );
                                        } );
                                        it ( "should return expected html(1)", () => {
                                            let instance = new Template ( "<p>{{name}}{%if names%}: {{names.last}}{%end%}</p>" );
                                            instance.render ( {
                                                name: "A",
                                                names: {
                                                    last: "B"
                                                }
                                            } ).should.equal ( "<p>A: B</p>" );
                                            instance.render ( {
                                                name: "A"
                                            } ).should.equal ( "<p>A</p>" );
                                        } );
                                        it ( "should return expected html(2)", () => {
                                            let instance = new Template ( "<p>{{name}}{%each names%}<br/>{{_names.pos}}: {{_names.value}}{%end%}</p>" );
                                            instance.render ( {
                                                name: "A",
                                                names: [ "a", "b" ]
                                            } ).should.equal ( "<p>A<br/>0: a<br/>1: b</p>" );
                                            instance.render ( {
                                                name: "A"
                                            } ).should.equal ( "<p>A</p>" );
                                        } );
                                        it ( "should return expected html(3)", () => {
                                            let instance = new Template ( "<p>{{name}}{%each names%}{%if _names.pos%}<br/>- {{_names.value}}{%end%}{%end%}</p>" );
                                            instance.render ( {
                                                name: "A",
                                                names: [ "a", "b" ]
                                            } ).should.equal ( "<p>A<br/>- b</p>" );
                                            instance.render ( {
                                                name: "A"
                                            } ).should.equal ( "<p>A</p>" );
                                        } );
                                        it ( "should return expected html(4)", () => {
                                            let instance = new Template ( "<p>{{name}}{%each names%}{%if _names.pos%}<br/>- {{_names.value}}{%end%}{%end%}</p>" );
                                            instance.render ( {
                                                name: "A",
                                                names: "no object"
                                            } ).should.equal ( "<p>A</p>" );
                                        } );
                                        it ( "should return expected html(5)", () => {
                                            let instance = new Template ( "<p>{{name}}{%each names%}<br/>- {{_names.value}}{%end%}</p>" );
                                            instance.render ( {
                                                name: "A",
                                                names: [
                                                    "<b>&B's \"big\"</b>"
                                                ]
                                            } ).should.equal ( "<p>A<br/>- &lt;b&gt;&amp;B&#039;s &quot;big&quot;&lt;/b&gt;</p>" );
                                        } );
                                        it ( "should return expected html(6)", () => {
                                            let instance = new Template ( "<ul>{%each names.list%}<li>{{_names#list.value}}</li>{%end%}</ul>" );
                                            instance.render ( {
                                                names: {
                                                    list: [
                                                        "<b>&B's \"big\"</b>"
                                                    ]
                                                }
                                            } ).should.equal ( "<ul><li>&lt;b&gt;&amp;B&#039;s &quot;big&quot;&lt;/b&gt;</li></ul>" );
                                        } );
                                        it ( "should return expected html(7)", () => {
                                            let instance = new Template ( "{%if id%}{{id}}{%end%}" );
                                            instance.render ( {id: 12} ).should.equal ( "12" );
                                        } );
                                        it ( "should return expected html(8)", () => {
                                            let instance = new Template ( "{%each id%}{{id}}{%end%}" );
                                            instance.render ( {id: 12} ).should.equal ( "" );
                                        } );
                                        it ( "should return expected html(9)", () => {
                                            let instance = new Template ( "{%each id%}{{_id.value.a}}{%end%}" );
                                            instance.render ( {id: [{a:5},{}]} ).should.equal ( "5" );
                                        } );
                                        it ( "should return expected html(10)", () => {
                                            let instance = new Template ( "{%each id%}{%if !_id.value.a%}{{_id.pos}}{%end%}{%end%}" );
                                            instance.render ( {id: [{a:5},{}]} ).should.equal ( "1" );
                                        } );
                                    } );
                                } );
                            } );
                        } );
                    } );
                } );
            } );
        } );
    } );
};