var config = require("config");
var winston = require("winston");

module.exports = new (winston.Logger)({
    transports: [
	new (winston.transports.Console)({level: "debug", colorize: true}),
	new (winston.transports.File)({
	    filename: config.app.log.file,
	    handleException: config.app.log.handleException,
	    level: "info"
	})
    ],
    levels: {
	debug: 0,
	info: 1,
	data: 2,
	warn: 3,
	error: 4 
    },
    exitOnError: false
});
