'use strict';

var expect = require('chai').expect;

describe('Quizas', function(){

	var quizas;

	var fixtures = {
		ftStream: require('./fixtures/ft-stream.json'),
		esArticle: require('./fixtures/es-article.json'),
		esResults: require('./fixtures/es-results.json')
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
		target = quizas(fixtures.ftStream, 'items.0.title').copy(target, 'title');
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
		result.forEach(function(item){
			expect(item).to.have.property('title');
			expect(item).to.have.property('relativeUrl');
			expect(item).to.have.property('label');
		})
	});

	it('Should be able to grab a specific item from an array', function(){
		var expected = {
			"idV1": "NTlhNzEyMzMtZjBjZi00Y2U1LTg0ODUtZWVjNmEyYmU1NzQ2-QnJhbmRz",
			"prefLabel": "Fast FT",
			"attributes": [],
			"taxonomy": "brand",
			"url": "https://www.ft.com/fastft",
			"primary": "brand",
			"relativeUrl": "/fastft"
		};

		var result = quizas(fixtures.ftStream, 'items.0.metadata.2').value;
		expect(result).to.deep.equal(expected);
	});

	it('Should be able to pluck values from an array whilst already plucking', function() {
		var result = quizas(fixtures.ftStream, 'items').pluck(
			'title',
			{source:'metadata', target:'meta', pluck:['taxonomy', 'prefLabel']}
		);
		expect(result).to.be.an('array');
		result.forEach(function(item){
			expect(item.meta).to.be.an('array');
			item.meta.forEach(function(m){
				expect(m).to.have.property('taxonomy');
				expect(m).to.have.property('prefLabel');
				expect(m).not.to.have.property('attributes');
			})
		});
	});

	it('Should be able to write deeply', function(){
		var expected = {brand: {name: fixtures.esArticle._source.annotations[0].prefLabel}};
		var result = quizas(fixtures.esArticle, '_source.annotations.0.prefLabel').copy({}, 'brand.name');
		expect(result).to.deep.equal(expected);
	});

	it('Should be able to extract values from an object', function(){
		var result = quizas(fixtures.esArticle).extract(
			['_id', 'id'],
			['_source.title', 'title'],
			['_source.comments.enabled', 'comments']
		);
		var expected = {
			id: fixtures.esArticle._id,
			title: fixtures.esArticle._source.title,
			comments: fixtures.esArticle._source.comments.enabled
		};

		expect(result).to.deep.equal(expected);
	});

	it('Should be able to transform values whilst extracting', function(){
		var transform = function(date){
			return new Date(date).toString();
		};
		const expected = transform(fixtures.esArticle._source._lastUpdatedDateTime);
		const result = quizas(fixtures.esArticle, '_source').extract({source:'_lastUpdatedDateTime', target:'date', transform:transform});
		expect(result).to.have.property('date');
		expect(result.date).to.equal(expected);
	});

	it('Should be able to transform values whilst plucking', function(){
		var transform = function(date){
			return new Date(date).toString();
		};
		var expected = fixtures.esResults.hits.hits.map(function(hit){
			return {date:transform(hit._source._lastUpdatedDateTime)};
		});
		var result = quizas(fixtures.esResults, 'hits.hits').pluck({source:'_source._lastUpdatedDateTime', target:'date', transform:transform})
		expect(result).to.deep.equal(expected);
	});

	describe('Bugs', function() {

		it('Should be able to cope with not being passed and object', function(){
			var result = quizas(null, 'prop');
			expect(result.hasValue).to.be.false;
		});

		it('Should still read falsy values', function(){
			var results = quizas(fixtures.esResults, 'hits.hits').pluck(['_source.isListed', 'isListed']);
			expect(results).to.have.length(fixtures.esResults.hits.hits.length);
			results.forEach(function(result){
				expect(result).to.have.property('isListed');
			})
		});

		it('Should return target object when copying null value', function(){
			var target = {foo:'bar'};
			var data = {blah: 'hat'};
			var result = quizas(data, 'non.existant').copy(target, 'newProp');
			expect(result).to.exist;
			expect(result).to.deep.equal(target);
		})
	})
});
