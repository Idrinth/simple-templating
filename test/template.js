var should = require ( "chai" ).should ();
var expect = require ( "chai" ).expect;
describe ( "template", function ( ) {
    it ( "should have a Template variable in scope", function ( ) {
        var Template = require ( "../src/template" );
        should.exist ( Template );
        describe ( "template.Template", function () {
            it ( "Template should be a function", function () {
                Template.should.be.a ( "function" );
                describe ( "template.Template()", function () {
                    it ( "Template() should throw if end tag is missing", function () {
                        expect(() => new Template ( "{{%if a%}}hi world" )).to.throw( "can't find end." );
                    });
                    it ( "Template() should throw if unknown tag is used", function () {
                        expect(() => new Template ( "{{%ef a%}}hi world{{%end%}}" )).to.throw( "Token ef is invalid." );
                    });
                    it ( "Template() should return an object", function () {
                        var instance = new Template ( "" );
                        instance.should.be.an ( "object" );
                        describe ( "template.Template#Instance", function () {
                            it ( "Template should have a property render", function () {
                                instance.should.have.property ( "render" );
                                describe ( "template.Template#Instance.render()", function () {
                                    it ( "render should return expected html(0)", function () {
                                        var instance = new Template ( "<p>{{name}}: {{names.last}}</p>" );
                                        instance.render ( {
                                            name: "A",
                                            names: {
                                                last: "B"
                                            }
                                        } ).should.equal ( "<p>A: B</p>" );
                                    } );
                                    it ( "render should return expected html(1)", function () {
                                        var instance = new Template ( "<p>{{name}}{{%if names%}}: {{names.last}}{{%end%}}</p>" );
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
                                    it ( "render should return expected html(2)", function () {
                                        var instance = new Template ( "<p>{{name}}{{%each names%}}<br/>{{_names.pos}}: {{_names.value}}{{%end%}}</p>" );
                                        instance.render ( {
                                            name: "A",
                                            names: [ "a", "b" ]
                                        } ).should.equal ( "<p>A<br/>0: a<br/>1: b</p>" );
                                        instance.render ( {
                                            name: "A"
                                        } ).should.equal ( "<p>A</p>" );
                                    } );
                                    it ( "render should return expected html(3)", function () {
                                        var instance = new Template ( "<p>{{name}}{{%each names%}}{{%if _names.pos%}}<br/>- {{_names.value}}{{%end%}}{{%end%}}</p>" );
                                        instance.render ( {
                                            name: "A",
                                            names: [ "a", "b" ]
                                        } ).should.equal ( "<p>A<br/>- b</p>" );
                                        instance.render ( {
                                            name: "A"
                                        } ).should.equal ( "<p>A</p>" );
                                    } );
                                    it ( "render should return expected html(4)", function () {
                                        var instance = new Template ( "<p>{{name}}{{%each names%}}{{%if _names.pos%}}<br/>- {{_names.value}}{{%end%}}{{%end%}}</p>" );
                                        instance.render ( {
                                            name: "A",
                                            names: "no object"
                                        } ).should.equal ( "<p>A</p>" );
                                    } );
                                    it ( "render should return expected html(5)", function () {
                                        var instance = new Template ( "<p>{{name}}{{%each names%}}<br/>- {{_names.value}}{{%end%}}</p>" );
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