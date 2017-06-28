"use strict";
/*globals module, require */
var api = require('./api');
var utils = require('./utils');


function quizas(obj, path, defaultValue) {
	var result = typeof path === 'undefined' ?
		{found: true, value:obj} :
		utils.deepRead(obj, path);

	if(!result.found && typeof defaultValue !== 'undefined'){
		result.found = true;
		result.value = defaultValue;
	}

	return api(quizas, result);
}

module.exports = quizas;
