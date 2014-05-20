var logger = require("../log/logger");
var userModel = require("../model/userModel");
var randoModel = require("../model/randoModel");
var config = require("config");
var Errors = require("../error/errors");
var async = require("async");

module.exports = {
    timer: null,
    pairImages: function () {
	logger.debug("PairRandosDemon start work");
	var self = this;
	randoModel.getAll(function (err, randos) {
	    if (err) {
		logger.warn("[pairImagesService.pairImages] Can't get all randos: ", err);
		return;
	    }

            var randos = self.findAndPairRandos(randos);

		if (randos.length >= 1 && oldRando && (Date.now() - randos[0].creation) >= config.app.demon.pairingTimeout) {
		    randos.push(oldRando);
		    randos.sort(function (rando1, rando2) {if (rando1 > rando2) return -1; else return 1;});
		    self.findAndPairRandos(randos);
		}
	    });
	});
    },
    findAndPairRandos: function (randos) {
	if (!randos) {
	    return [];
	}

	for (var i = 0; i < randos.length; i++) {
	    var currentRando = randos[i];
	    var rando = this.findRandoForUser(currentRando, randos);
	    if (rando) {
		this.connectRandos(currentRando, rando);
	    }
	}

	return randos;
    },
    findRandoForUser: function (rando, randos) {
	logger.debug("Start findRandoForUser");
	for (var i = 0; i < randos.length; i++) {
	    if (rando.email != randos[i].email) {
		return randos.splice(i, 1)[0];
	    }
	}
	return null;
    },
    connectRandos: function (rando1, rando2) {
	this.processRandoForUser(rando1.email, rando2);
	this.processRandoForUser(rando2.email, rando1);
    },
    processRandoForUser: function (email, rando) {
	userModel.getByEmail(email, function (err, user) {
	    if (err) {
		logger.warn("Data base error when getByEmail: ", userId);
		return;
	    }

	    if (!user) {
		logger.warn("User not found: ", email);
		return;
	    }

	    for (var i = 0; i < user.randos.length; i++) {
		if (!user.randos[i].stranger.email) {
		    logger.debug("Rando for pairing found");
		    user.randos[i].stranger = rando;
                    async.parallel({
                        rmRando: function (done) {
                            randoModel.remove(rando, done);
                        },
                        updateUser: function (done) {
                            userModel.update(user, done);
                        }
                    }, function (err) {
                        if (err) {
                            logger.warn("Can't remove rando or/and update user, because: ", err);
                        } 
                    });
		}
	    }
	});
    },
    startDemon: function () {
	logger.info("Start pair randos demon with interval wakeup: ", config.app.demon.wakeup);
	var self = this;
	this.timer = setInterval(function () {
	    self.pairImages();
	}, config.app.demon.wakeup);
    },
    stopDemon: function () {
	if (this.timer) {
	    logger.info("Stop pair randos demon");
	    clearInterval(this.timer);
	    this.timer = null;
	}
    }
};
