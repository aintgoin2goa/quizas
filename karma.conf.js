// Karma configuration
// Generated on Fri Mar 17 2017 08:29:30 GMT+0000 (GMT)

var customLaunchers = {
	sl_ie_11: {
		base: 'SauceLabs',
		browserName: 'internet explorer',
		platform: 'Windows 8.1',
		version: '11'
	},
	// sl_ie_9: {
	// 	base: 'SauceLabs',
	// 	browserName: 'internet explorer',
	// 	platform: 'Windows 7',
	// 	version: '9.0'
	// },
	// sl_edge_13: {
	// 	base: 'SauceLabs',
	// 	browserName: 'MicrosoftEdge',
	// 	platform: 'Windows 10',
	// 	version: '13.10586'
	// },
	// sl_ios_9: {
	// 	base: 'SauceLabs',
	// 	browserName: 'Safari',
	// 	appiumVersion: '1.5.3',
	// 	deviceName: 'iPhone 6 Device',
	// 	platformVersion: '9.3',
	// 	platformName: 'iOS'
	// },
	// sl_android_6: {
	// 	base: 'SauceLabs',
	// 	browserName: 'Chrome',
	// 	appiumVersion: '1.5.3',
	// 	deviceName: 'Samsung Galaxy S6 Device',
	// 	platformVersion: '6.0',
	// 	platformName: 'Android'
	// }
}


module.exports = function(config) {
	var configBase = {
		basePath: '',
		frameworks: ['mocha'],
		files: [
			'test/quizas.built.js'
		],
		port: 9876,
		logLevel: config.LOG_INFO,
		colors: true,
		autoWatch: false
	};

	var localConfig = {
		reporters: ['progress'],
		browsers: [
			'Chrome',
			'Firefox',
			'Safari'
		],
		singleRun: true,
		concurrency: Infinity
	};

	var ciConfig = {
		sauceLabs: {
			testName: 'Quizas tests',
			recordScreenshots: false,
			connectOptions: {
				port: 5757,
				logfile: 'sauce_connect.log'
			}
		},
		reporters: ['progress', 'saucelabs'],
		singleRun: true,
		customLaunchers: customLaunchers,
		browsers: Object.keys(customLaunchers),
		concurrency: 5,
		captureTimeout: (1000 * 60) * 5,
		public: 'public'
	};

	var mergedConfig = Object.assign({}, configBase, process.env.CI ? ciConfig : localConfig);
	config.set(mergedConfig);
};
