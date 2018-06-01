var should = require ( "chai" ).should ();
var expect = require ( "chai" ).expect;
var rewire = require( "rewire" );
describe ( "template", function ( ) {
    var template = rewire ( "../src/template" );
    it ( "should have a ConditionTag variable in scope", function ( ) {
        var ConditionTag = template.__get__( "ConditionTag" );
        should.exist ( ConditionTag );
        describe("template.ConditionTag", function() {
            it ("ConditionTag should be a function", function () {
                ConditionTag.should.be.a("function");
                describe("template.ConditionTag()", function() {
                    it ("ConditionTag() should return an object", function () {
                        var instance = new ConditionTag("", "");
                        instance.should.be.an("object");
                        describe("template.ConditionTag#Instance", function() {
                            it ("ConditionTag should have a property render", function () {
                                instance.should.have.property("render");
                                describe("template.ConditionTag#Instance.render()", function() {
                                    var instance = new ConditionTag("name", {render: function() {return "B";}});
                                    it ("render should return expected html(0)", function() {
                                        instance.render({name: "A"}).should.equal("B");
                                    });
                                    it ("render should return expected html(1)", function() {
                                        instance.render({name: ""}).should.equal("");
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});