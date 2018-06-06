const should = require ( "chai" ).should ();
const expect = require ( "chai" ).expect;
describe ( "template", () => {
    it ( "should have a Template variable in scope", () => {
        const Template = require ( "../src/template" );
        should.exist ( Template );
        describe ( "template.Template", () => {
            it ( "Template should be a function", () => {
                Template.should.be.a ( "function" );
                describe ( "template.Template()", () => {
                    it ( "should throw if end tag is missing", () => {
                        expect(() => new Template ( "{{%if a%}}hi world" )).to.throw( "can't find end." );
                    });
                    it ( "should throw if unknown tag is used", () => {
                        expect(() => new Template ( "{{%ef a%}}hi world{{%end%}}" )).to.throw( "Token ef is invalid." );
                    });
                    it ( "should return an object", () => {
                        let instance = new Template ( "" );
                        instance.should.be.an ( "object" );
                        describe ( "template.Template#Instance", () => {
                            it ( "should have a property render", () => {
                                instance.should.have.property ( "render" );
                                describe ( "template.Template#Instance.render()", () => {
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
                                        let instance = new Template ( "<p>{{name}}{{%if names%}}: {{names.last}}{{%end%}}</p>" );
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
                                        let instance = new Template ( "<p>{{name}}{{%each names%}}<br/>{{_names.pos}}: {{_names.value}}{{%end%}}</p>" );
                                        instance.render ( {
                                            name: "A",
                                            names: [ "a", "b" ]
                                        } ).should.equal ( "<p>A<br/>0: a<br/>1: b</p>" );
                                        instance.render ( {
                                            name: "A"
                                        } ).should.equal ( "<p>A</p>" );
                                    } );
                                    it ( "should return expected html(3)", () => {
                                        let instance = new Template ( "<p>{{name}}{{%each names%}}{{%if _names.pos%}}<br/>- {{_names.value}}{{%end%}}{{%end%}}</p>" );
                                        instance.render ( {
                                            name: "A",
                                            names: [ "a", "b" ]
                                        } ).should.equal ( "<p>A<br/>- b</p>" );
                                        instance.render ( {
                                            name: "A"
                                        } ).should.equal ( "<p>A</p>" );
                                    } );
                                    it ( "should return expected html(4)", () => {
                                        let instance = new Template ( "<p>{{name}}{{%each names%}}{{%if _names.pos%}}<br/>- {{_names.value}}{{%end%}}{{%end%}}</p>" );
                                        instance.render ( {
                                            name: "A",
                                            names: "no object"
                                        } ).should.equal ( "<p>A</p>" );
                                    } );
                                    it ( "should return expected html(5)", () => {
                                        let instance = new Template ( "<p>{{name}}{{%each names%}}<br/>- {{_names.value}}{{%end%}}</p>" );
                                        instance.render ( {
                                            name: "A",
                                            names: [
                                                "<b>&B's \"big\"</b>"
                                            ]
                                        } ).should.equal ( "<p>A<br/>- &lt;b&gt;&amp;B&#039;s &quot;big&quot;&lt;/b&gt;</p>" );
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