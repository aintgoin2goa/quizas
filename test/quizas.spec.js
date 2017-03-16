'use strict';

var expect = require('chai').expect;

describe('Quizas', function(){

	var quizas;

	var fixtures = {
		ftStream: require('./fixtures/ft-stream.json')
	};

	before(function(){
		quizas = require('../src/quizas');
	});

	it('Should deeply read a value from an object', function() {
		var expected = "is_company";
		var result = quizas(fixtures.ftStream, 'items.0.metadata.0.attributes.0.key').value;
		expect(result).to.equal(expected);
	});

	it('Should not set a value if it is not found', function(){
		var result = quizas(fixtures.ftStream, 'items.0.metadata.0.attributes.0.foo');
		expect(result.hasValue).to.be.false;
	});

	it('Should not set a value if the path is incorrect', function(){
		var result = quizas(fixtures.ftStream, 'items.0.nonexistantkey.0.attributes.0.key');
		expect(result.hasValue).to.be.false;
		expect(result.value).to.be.null;
	});

	it('Should be able to copy values to a different object', function(){
		var expected = {title:'Ride-hailing app Grab to hire 800 developers'};
		var target = {};
		quizas(fixtures.ftStream, 'items.0.title').copy(target, 'title');
		expect(target).to.deep.equal(expected);
	});

	it('Should be able to pluck values from an array of objects', function(){
		var result = quizas(fixtures.ftStream, 'items').pluck('title', 'relativeUrl', 'primaryTag.prefLabel')
		expect(result).to.be.an('array');
		expect(result.length).to.equal(fixtures.ftStream.items.length);
		result.forEach(function(item){
			expect(item).to.have.property('title');
			expect(item).to.have.property('relativeUrl');
			expect(item).to.have.property('primaryTag');
			expect(item.primaryTag).to.have.property('prefLabel');
		})
	});

	it('Should be able to pluck values, mapping them to a different key in the target', function(){
		var result = quizas(fixtures.ftStream, 'items').pluck('title', 'relativeUrl', ['primaryTag.prefLabel', 'label'])
		expect(result).to.be.an('array');
		expect(result.length).to.equal(fixtures.ftStream.items.length);
		console.log(result);
		result.forEach(function(item){
			expect(item).to.have.property('title');
			expect(item).to.have.property('relativeUrl');
			expect(item).to.have.property('label');
		})
	});
});