var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('../schema/api/user');
var googleConfig = require('../googles.js');
var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;


module.exports = function(passport) {

    passport.use('google', new GoogleStrategy({
        clientID        : googleConfig.appID,
        clientSecret    : googleConfig.appSecret,
        callbackURL     : googleConfig.callbackUrl,
        profileFields   : [
          "id",
          "displayName",
          "email",
          "gender",
          "profileUrl",
          "picture.type(large)"
        ]
    },

    // facebook will send back the tokens and profile
    function(access_token, refresh_token, profile, done) {

    	console.log('profile', profile);

		// asynchronous
		process.nextTick(async function() {

			// find the user in the database based on their facebook id


	        User.findOne({ '_id' : profile.id }, function(err, user) {

	        	// if there is an error, stop everything and return that
	        	// ie an error connecting to the database
	            if (err)
	                return done(err);

				// if the user is found, then log them in
	            if (user) {
	                return done(null, user); // user found, return that user
	            } else {
	                // if there is no user found with that facebook id, create them
	                var newUser = new User();


					// set all of the facebook information in our user model
   			        newUser._id      = profile.id; // set the users facebook id	                
	                newUser.google.id    = profile.id; // set the users facebook id	                
	                newUser.google.access_token = access_token; // we will save the token that facebook provides to the user	                
	                newUser.google.firstName  = profile.name.givenName;
	                newUser.google.lastName = profile.name.familyName; // look at the passport user profile to see how names are returned
	                newUser.google.email = profile.email || '' //profile.emails[0].value; // facebook can return multiple emails so we'll take the first
	                newUser.google.profile_pic = profile.photos[0].value || '' //profile.emails[0].value; // facebook can return multiple emails so we'll take the first

					// save our user to the database
	                newUser.save(function(err) {
	                    if (err)
	                        throw err;

	                    // if successful, return the new user
	                    return done(null, newUser);
	                });
	            }

			});
			

        });

    }));

};
