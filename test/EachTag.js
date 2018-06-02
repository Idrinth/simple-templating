var should = require ( "chai" ).should ();
var expect = require ( "chai" ).expect;
var rewire = require ( "rewire" );
describe ( "template", function ( ) {
    var template = rewire ( "../src/template" );
    it ( "should have a EachTag variable in scope", function ( ) {
        var EachTag = template.__get__ ( "EachTag" );
        should.exist ( EachTag );
        describe ( "template.EachTag", function () {
            it ( "EachTag should be a function", function () {
                EachTag.should.be.a ( "function" );
                describe ( "template.EachTag()", function () {
                    it ( "EachTag() should return an object", function () {
                        var instance = new EachTag ( "", "" );
                        instance.should.be.an ( "object" );
                        describe ( "template.EachTag#Instance", function () {
                            it ( "EachTag should have a property render", function () {
                                instance.should.have.property ( "render" );
                                describe ( "template.EachTag#Instance.render()", function () {
                                    var instance = new EachTag ( "name", {
                                        render ( data ) {
                                            return JSON.stringify ( data );
                                        }
                                    } );
                                    it ( "render should return expected html(0)", function () {
                                        let result = instance.render ( {
                                            name: [ "A", "B", "Q" ]
                                        } ).split ( "}{" );
                                        JSON.parse ( result[0] + "}" ).should.deep.equal ( {
                                            name: [ "A", "B", "Q" ],
                                            _name: {
                                                key: 0,
                                                value: "A",
                                                even: true,
                                                pos: 0
                                            }
                                        } );
                                        JSON.parse ( "{" + result[1] + "}" ).should.deep.equal ( {
                                            name: [ "A", "B", "Q" ],
                                            _name: {
                                                key: 1,
                                                value: "B",
                                                even: false,
                                                pos: 1
                                            }
                                        } );
                                        JSON.parse ( "{" + result[2] ).should.deep.equal ( {
                                            name: [ "A", "B", "Q" ],
                                            _name: {
                                                key: 2,
                                                value: "Q",
                                                even: true,
                                                pos: 2
                                            }
                                        } );
                                    } );
                                    it ( "render should return expected html(1)", function () {
                                        let result = instance.render ( {
                                            name: {
                                                a: "l",
                                                q: "uuuu"
                                            }
                                        } ).split ( "}{" );
                                        JSON.parse ( result[0] + "}" ).should.deep.equal ( {
                                            name: {
                                                a: "l",
                                                q: "uuuu"
                                            },
                                            _name: {
                                                key: "a",
                                                value: "l",
                                                even: true,
                                                pos: 0
                                            }
                                        } );
                                        JSON.parse ( "{" + result[1] ).should.deep.equal ( {
                                            name: {
                                                a: "l",
                                                q: "uuuu"
                                            },
                                            _name: {
                                                key: "q",
                                                value: "uuuu",
                                                even: false,
                                                pos: 1
                                            }
                                        } );
                                    } );
                                    it ( "render should return expected html(2)", function () {
                                        instance.render ( {
                                            name: "m"
                                        } ).should.be.equal ( "" );
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