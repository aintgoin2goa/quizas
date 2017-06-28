'use strict';
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

	if(arguments.length === 1) {
		return isARealValue(obj);
	}else if(typeof obj === 'string'){
		return false;
	}else{
		return prop in obj && isARealValue(obj[prop]);
	}
}

var FIND_REGEX = /([\w]+)([=])"([\w ]+)"/i;

function find(arr, findStr){
	var findOptions = FIND_REGEX.exec(findStr);
	var left = findOptions[1].replace(/\|/g, '.');
	var right = findOptions[3];
	var operator = findOptions[2];
	return arr.filter(function(a){
		var value = deepRead(a, left);
		if(!value.found){
			return false;
		}

		switch(operator){
			case '=': return value.value === right;
		}
	});
}

function deepRead(obj, path){
	if(typeof obj !== 'object' || obj === null){
		return {found:false,value:null};
	}

	var found = true;

	if(path.indexOf('.') > -1){
		path = path.split('.');
	}

	if(typeof path !== 'object'){
		return isSet(obj, path) ? {found:true, value:obj[path]} : {found:false, value:null};
	}

	for(var i=0, l=path.length; i<l; i++){
		var prop = path[i];
		if(prop.match(FIND_REGEX)){
			obj = find(obj, prop);
		}else if(obj && isSet(obj, prop)){
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

module.exports = {
	clone: clone,
	isObject: isObject,
	isSet: isSet,
	find: find,
	deepRead: deepRead,
	deepWrite: deepWrite
};
