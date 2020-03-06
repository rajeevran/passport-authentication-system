var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
var User = require('../schema/api/user');
var linkedinConfig = require('../linkedin.js');
var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;


module.exports = function(passport) {

console.log('linkedinConfig--',linkedinConfig)


	passport.use('linkedin', new LinkedInStrategy({
	  clientID: linkedinConfig.appID,
	  clientSecret: linkedinConfig.appSecret,
	  callbackURL: linkedinConfig.callbackUrl,
	  scope: ['r_emailaddress', 'r_liteprofile'],
	  state: true
	}, function(access_token, refreshToken, profile, done) {
	  // asynchronous verification, for effect...
	  console.log('profile', profile);
	  process.nextTick(function () {

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
	                newUser.linkedin.id    = profile.id; // set the users facebook id	                
	                newUser.linkedin.access_token = access_token; // we will save the token that facebook provides to the user	                
	                newUser.linkedin.firstName  = profile.name.givenName;
	                newUser.linkedin.lastName = profile.name.familyName; // look at the passport user profile to see how names are returned
	                newUser.linkedin.email = profile.emails.length> 0 ? profile.emails[0].value : '' //profile.emails[0].value; // facebook can return multiple emails so we'll take the first
	                newUser.linkedin.profile_pic = profile.photos.length> 0 ? profile.photos[0].value : '' //profile.emails[0].value; // facebook can return multiple emails so we'll take the first

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
	}

    ));

};
