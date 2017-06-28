'use strict';
/*globals module,require */

function value (result) {
	return result.value;
}

function hasValue (result) {
	return result.found;
}

var apiFunctions = {
	copy: function copy (quizas, utils, result, target, prop) {
		if(result.found){
			return utils.deepWrite(target, prop, result.value);
		}else{
			return utils.clone(target);
		}
	},

	pluck: function pluck () {
		// args are (quizas, utils, result, ...props) but trying to support es5 without transpilation
		var args = [].slice.apply(arguments);
		var quizas = args.shift();
		var utils = args.shift();
		var result = args.shift();
		var props = args;
		if(!result.found || !Array.isArray(result.value)){
			return [];
		}

		return result.value.map(function(item){
			var plucked = {};
			props.forEach(function(prop){
				if(Array.isArray(prop)){
					prop = {source:prop[0],target:prop[1]};
				}else if(typeof prop === 'string'){
					prop = {source:prop, target:prop};
				}

				var q = quizas(item, prop.source);
				var value = prop.pluck ? q.pluck.apply(q, prop.pluck) : q.value;
				if(utils.isSet(value) && prop.transform){
					value = prop.transform(value);
				}

				if(utils.isSet(value)){
					plucked = utils.deepWrite(plucked, prop.target, value);
				}
			});

			return plucked;
		});
	},

	pluckValues: function pluckValues (quizas, utils, result, prop) {
		if(!result.found || !Array.isArray(result.value)){
			return [];
		}

		var values = [];

		result.value.forEach(function(r){
			var itemResult = utils.deepRead(r, prop);
			if(itemResult.found){
				values.push(itemResult.value);
			}
		});

		return values;
	},

	extract: function extract () {
		var args = [].slice.apply(arguments);
		var quizas = args.shift();
		var utils = args.shift();
		var result = args.shift();
		var props = args;

		if(!result.found || !utils.isObject(result.value)){
			return {};
		}

		var extracted = {};
		props.forEach(function(prop){
			if(typeof prop === 'string'){
				prop = {source:prop,target:prop};
			}else if(Array.isArray(prop)){
				prop = {source:prop[0], target:prop[1]};
			}

			var q = quizas(result.value, prop.source);
			var value = prop.pluck ? q.pluck.apply(q, prop.pluck) : q.value;
			if(utils.isSet(value)){
				if(prop.transform){
					value = prop.transform(value);
				}

				extracted = utils.deepWrite(extracted, prop.target, value);
			}
		});

		return extracted;
	},

	filter: function (quizas, utils, result, func) {
		if(!result.found || !Array.isArray(result.value)){
			return [];
		}

		return result.value.filter(func);
	},

	map: function (quizas, utils, result, func) {
		if(!result.found || !Array.isArray(result.value)){
			return [];
		}

		return result.value.map(func);
	}
};

module.exports = function buildApi (quizas, result) {
	var utils = require('./utils');
	var api = Object.create({}, {
		value: {get: value.bind(null, result)},
		hasValue: {get: hasValue.bind(null, result)}
	});

	Object.keys(apiFunctions)
		.forEach(function(name){
			api[name] = apiFunctions[name].bind(null, quizas, utils, result);
		});

	return api;
};
