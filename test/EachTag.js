var should = require ( 'chai' ).should ();
var expect = require ( 'chai' ).expect;
var rewire = require( 'rewire' );
describe ( 'template', function ( ) {
    var template = rewire ( "../src/template" );
    it ( 'should have a EachTag variable in scope', function ( ) {
        var EachTag = template.__get__( 'EachTag' );
        should.exist ( EachTag );
        describe('template.EachTag', function() {
            it ('EachTag should be a function', function () {
                EachTag.should.be.a('function');
                describe('template.EachTag()', function() {
                    it ('EachTag() should return an object', function () {
                        var instance = new EachTag('', '');
                        instance.should.be.an('object');
                        describe('template.EachTag#Instance', function() {
                            it ('EachTag should have a property render', function () {
                                instance.should.have.property('render');
                                describe('template.EachTag#Instance.render()', function() {
                                    var instance = new EachTag('name', {render: function(data) {return JSON.stringify (data);}});
                                    it ('render should return expected html(0)', function() {
                                        let result = instance.render({name: ['A','B','Q']}).split('}{');
                                        JSON.parse (result[0]+'}').should.deep.equal({name:["A","B",'Q'],name_key:0,name_value:"A",name_even:true,name_pos:0});
                                        JSON.parse ('{'+result[1]+'}').should.deep.equal({name:["A","B",'Q'],name_key:1,name_value:"B",name_even:false,name_pos:1});
                                        JSON.parse ('{'+result[2]).should.deep.equal({name:["A","B",'Q'],name_key:2,name_value:"Q",name_even:true,name_pos:2});
                                    });
                                    it ('render should return expected html(1)', function() {
                                        let result = instance.render({name: {a: 'l', q:'uuuu'}}).split('}{');
                                        JSON.parse (result[0]+'}').should.deep.equal({name:{a:'l',q:'uuuu'},name_key:"a",name_value:"l",name_even:true,name_pos:0});
                                        JSON.parse ('{'+result[1]).should.deep.equal({name:{a:'l',q:'uuuu'},name_key:"q",name_value:"uuuu",name_even:false,name_pos:1});
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