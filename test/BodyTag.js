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
                                    var instance = new BodyTag ( "<p>{{name}}: {{names.last}}</p>" );
                                    it ( "render should return expected html(0)", function () {
                                        instance.render ( {
                                            name: "A",
                                            names: {
                                                last: "B"
                                            }
                                        } ).should.equal ( "<p>A: B</p>" );
                                    } );
                                    it ( "render should return expected html(1)", function () {
                                        instance.render ( {
                                            name: "A",
                                            names: {
                                                last: "<b>&B's \"big\"</b>"
                                            }
                                        } ).should.equal ( "<p>A: &lt;b&gt;&amp;B&#039;s &quot;big&quot;&lt;/b&gt;</p>" );
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