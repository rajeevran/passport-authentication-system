var mongoose = require("mongoose");
var bcrypt = require('bcrypt-nodejs');

//Create UserSchema
var UserSchema = new mongoose.Schema({

	_id:{ type: String },

	fb: {
		id: String,
		access_token: String,
		firstName: String,
		lastName: String,
		email: String,
		profile_pic:String
	},
	google: {
		id: String,
		access_token: String,
		firstName: String,
		lastName: String,
		email: String,
		profile_pic:String
	},
	linkedin: {
		id: String,
		access_token: String,
		firstName: String,
		lastName: String,
		email: String,
		profile_pic:String
	},

	twitter: {
		id: String,
		token: String,
		username: String,
		displayName: String,
		lastStatus: String
	}

},{
    timestamps: true
});

// Export your module
module.exports = mongoose.model("User", UserSchema);
