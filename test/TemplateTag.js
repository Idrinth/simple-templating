var should = require ( 'chai' ).should ();
var expect = require ( 'chai' ).expect;
var rewire = require( 'rewire' );
describe ( 'template', function ( ) {
    var template = rewire ( "../src/template" );
    it ( 'should have a TemplateTag variable in scope', function ( ) {
        var TemplateTag = template.__get__( 'TemplateTag' );
        should.exist ( TemplateTag );
        describe('template.TemplateTag', function() {
            it ('TemplateTag should be a function', function () {
                TemplateTag.should.be.a('function');
                describe('template.TemplateTag()', function() {
                    it ('TemplateTag() should return an object', function () {
                        var instance = new TemplateTag();
                        instance.should.be.an('object');
                        describe('template.TemplateTag#Instance', function() {
                            it ('TemplateTag should have a property render', function () {
                                instance.should.have.property('render');
                                describe('template.TemplateTag#Instance.render()', function() {
                                    it ('TemplateTag should throw an Exception', function () {
                                        expect(instance.render).to.throw('The child class has to implement this!');
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