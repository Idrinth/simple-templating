var should = require ( "chai" ).should ();
var expect = require ( "chai" ).expect;
var rewire = require ( "rewire" );
describe ( "template", function ( ) {
    var template = rewire ( "../src/template" );
    it ( "should have a BodyTag variable in scope", function ( ) {
        var BodyTag = template.__get__ ( "BodyTag" );
        should.exist ( BodyTag );
        describe ( "template.BodyTag", function () {
            it ( "BodyTag should be a function", function () {
                BodyTag.should.be.a ( "function" );
                describe ( "template.BodyTag()", function () {
                    it ( "BodyTag() should return an object", function () {
                        var instance = new BodyTag ( "" );
                        instance.should.be.an ( "object" );
                        describe ( "template.BodyTag#Instance", function () {
                            it ( "BodyTag should have a property render", function () {
                                instance.should.have.property ( "render" );
                                describe ( "template.BodyTag#Instance.render()", function () {
                                    it ( "render should return expected html(0)", function () {
                                        var instance = new BodyTag ( "<p>{{name}}: {{names.last}}</p>" );
                                        instance.render ( {
                                            name: "A",
                                            names: {
                                                last: "B"
                                            }
                                        } ).should.equal ( "<p>A: B</p>" );
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