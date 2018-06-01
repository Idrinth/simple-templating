var should = require ( "chai" ).should ();
var expect = require ( "chai" ).expect;
var rewire = require ( "rewire" );
describe ( "template", function ( ) {
    var template = rewire ( "../src/template" );
    it ( "should have a Template variable in scope", function ( ) {
        var Template = template.__get__ ( "Template" );
        should.exist ( Template );
        describe ( "template.Template", function () {
            it ( "Template should be a function", function () {
                Template.should.be.a ( "function" );
                describe ( "template.Template()", function () {
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
                                        var instance = new Template ( "<p>{{name}}{{%each names%}}<br/>{{names_pos}}: {{names_value}}{{%end%}}</p>" );
                                        instance.render ( {
                                            name: "A",
                                            names: [ "a", "b" ]
                                        } ).should.equal ( "<p>A<br/>0: a<br/>1: b</p>" );
                                        instance.render ( {
                                            name: "A"
                                        } ).should.equal ( "<p>A</p>" );
                                    } );
                                    it ( "render should return expected html(3)", function () {
                                        var instance = new Template ( "<p>{{name}}{{%each names%}}{{%if names_pos%}}<br/>- {{names_value}}{{%end%}}{{%end%}}</p>" );
                                        instance.render ( {
                                            name: "A",
                                            names: [ "a", "b" ]
                                        } ).should.equal ( "<p>A<br/>- b</p>" );
                                        instance.render ( {
                                            name: "A"
                                        } ).should.equal ( "<p>A</p>" );
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