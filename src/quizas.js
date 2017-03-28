"use strict";
/*globals module */

function isObject(obj){
	return obj === Object(obj);
}

function clone(obj){
	return JSON.parse(JSON.stringify(obj));
}

function isSet(obj, prop){
	var isARealValue = function(value){
		return value !== null && typeof value !== 'undefined';
	};

	if(arguments.length === 1){
		return isARealValue(obj);
	}else{
		return prop in obj && isARealValue(obj[prop]);
	}
}

function deepRead(obj, path){
	if(typeof obj !== 'object' || obj === null){
		return {found:false,value:null};
	}

	var found = true;

	if(path.indexOf('.') > -1){
		path = path.split('.');
	}

	if(typeof path === 'string'){
		return isSet(obj, path) ? {found:true, value:obj[path]} : {found:false, value:null};
	}

	for(var i=0, l=path.length; i<l; i++){
		var prop = path[i];
		if(obj && isSet(obj, prop)){
			obj = obj[prop];
		}else{
			found = false;
			break;
		}
	}

	return found ? {found:true, value:obj} : {found:false, value:null};
}

function deepWrite(obj, path, value){
	var root = clone(obj);
	obj = root;

	if(path.indexOf('.') > -1){
		path = path.split('.');
	}

	if(typeof path === 'string'){
		obj[path] = value;
		return root;
	}

	for(var i=0, l=path.length; i<l; i++){
		// we've reached the bottom - write the value
		if(i === l-1){
			obj[path[i]] = value;

		// if the property is not already set, set it to an empty object and drill down
		}else if(!isSet(obj, path[i])){
			obj[path[i]] = {};
			obj = obj[path[i]];
		}else{
			break;
		}
	}

	return root;
}

function quizas(obj, path) {
	var result = typeof path === 'undefined' ?
		{found: true, value:obj} :
		deepRead(obj, path);

	return Object.defineProperties({}, {
		'value' : {
			get: function(){
				return result.value;
			}
		},
		'hasValue': {
			get: function(){
				return result.found;
			}
		},
		'copy': {
			value: function(target, prop){
				if(result.found){
					return deepWrite(target, prop, result.value);
				}else{
					return clone(target);
				}
			}
		},
		'pluck': {
			value: function(){
				var props = [].slice.apply(arguments);
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
						if(isSet(value)){
							plucked = deepWrite(plucked, prop.target, value);
						}
					});

					return plucked;
				});
			}
		},
		'extract': {
			value: function(){
				if(!result.found || !isObject(result.value)){
					return {};
				}

				var props = [].slice.apply(arguments);
				var extracted = {};
				props.forEach(function(prop){
					if(typeof prop === 'string'){
						prop = {source:prop,target:prop};
					}else if(Array.isArray(prop)){
						prop = {source:prop[0], target:prop[1]};
					}

					var q = quizas(result.value, prop.source);
					var value = prop.pluck ? q.pluck.apply(q, prop.pluck) : q.value;
					if(value){
						extracted = deepWrite(extracted, prop.target, value);
					}
				});

				return extracted;
			}
		}
	});
}

module.exports = quizas;
