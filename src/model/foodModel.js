var mongoose = require("mongoose");
var config = require("config");
var logger = require("../log/logger");

var Food = mongoose.model("food", new mongoose.Schema({
    user: String,
    location: {
	latitude: Number,
	longitude: Number
    },
    creation: Number,
    foodId: String,
    foodUrl: String,
    mapUrl: String,
    report: Number,
    bonAppetit: Number
}));

module.exports = {
    add: function (userId, location, creation, foodId, foodUrl, mapUrl, callback) {
	logger.data("[foodModel.add] Food add. User: ", userId, " , location: ", location, ", creation: ", creation, ", foodId: ", foodId, "foodUrl: ", foodUrl, "mapUrl: ", mapUrl);

	if (!callback) {
	    callback = function (err) {
		if (err) {
		    logger.warn("[foodModel.add] Can't add food! User: ", userId, " location: ", location, " creation: ", creation, " foodId: ", foodId, "foodUrl: ", foodUrl, "mapUrl: ", mapUrl, " , because: ", err);
 		    return;
		}
		logger.debug("[foodModel.add] Food added. User: ", userId, " location: ", location, " creation: ", creation, "foodId: ", foodId, " foodUrl: ", foodUrl, "mapUrl: ", mapUrl);
	    }
	}

	var food = new Food({
	    user: userId,
	    location: location,
	    creation: creation,
	    foodId: foodId,
	    bonAppetit: 0,
	    report: 0,
	    foodUrl: foodUrl,
	    mapUrl: mapUrl
	});

	food.save(callback);
    },
    getAll: function (callback) {
	logger.data("[foodModel.getAll]");
	Food.find({}, callback);
    },
    remove: function (food) {
	logger.data("[foodModel.remove] Try remove food");
	food.remove(function (err) {
	    if (err) {
		logger.warn("[foodModel.remove] Can't remove food, because: ", err); 
		return;
	    }
	    logger.debug("[foodModel.remove] Food removed. User: ", food.user, " location: ", food.location, "creation: ", food.user.creation, " foodId: ", food.foodId, " foodUrl: ", food.foodUrl, "mapUrl: ", food.mapUrl);
	});
    },
    update: function (food, callback) {
	logger.data("[foodModel.update] Update food: ", food.foodId);

	if (!callback) {
	    callback = function (err) {
		if (err) {
		    logger.warn("[foodModel.update] Can't update food " , food.foodId, " because: ", err);
		    return;
		}

		logger.debug("[foodModel.update] Food ", food.foodId, " updated");
	    };
	}

	food.save(callback);
    }
}
