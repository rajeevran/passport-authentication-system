
const request = require("request");

var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../schema/api/user');
var fbConfig = require('../fb.js');
var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;
module.exports = function(passport) {

    passport.use('facebook', new FacebookStrategy({
        clientID        : fbConfig.appID,
        clientSecret    : fbConfig.appSecret,
        callbackURL     : fbConfig.callbackUrl,
        profileFields   : [
          "id",
          "displayName",
          "email",
          "gender",
          "profileUrl",
          "picture.type(large)"
        ]
    },

    // function(req, token, profile, done) {

    // },

    // facebook will send back the tokens and profile
    function(access_token, refresh_token, profile, done) {
    //function(token, profile, done) {
    	console.log('profile', profile);
    	console.log('profile pic--->', profile.photos[0].value);


        let url = "https://graph.facebook.com/v3.2/me?" +
                  "fields=id,name,email,first_name,last_name&access_token=" + access_token;

        console.log('url------->',url); 

        request({
            url: url,
            json: true
        }, function (err, response, body) {
              let email = body.email;  // body.email contains your email
              console.log('body------->',body); 

			// find the user in the database based on their facebook id


	        User.findOne({ '_id' : body.id }, function(err, user) {

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
				    newUser._id      = body.id; // set the users facebook id	                
	                newUser.fb.id    = body.id; // set the users facebook id	                
	                newUser.fb.access_token = access_token; // we will save the token that facebook provides to the user	                
	                newUser.fb.firstName  = body.first_name;
	                newUser.fb.lastName = body.last_name; // look at the passport user profile to see how names are returned

	                newUser.fb.email = body.email//profile.emails[0].value; // facebook can return multiple emails so we'll take the first
	                newUser.fb.profile_pic = profile.photos[0].value || '' //profile.emails[0].value; // facebook can return multiple emails so we'll take the first

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
		// asynchronous
		//process.nextTick(async function() {

			// find the user in the database based on their facebook id
			// let findUser = await User.findOne({ '_id' : '5e5f9f287845634ca0b4606f' })
			// console.log('findUser--->',findUser)

	  //       User.findOne({ '_id' : profile.id }, function(err, user) {

	  //       	// if there is an error, stop everything and return that
	  //       	// ie an error connecting to the database
	  //           if (err)
	  //               return done(err);

			// 	// if the user is found, then log them in
	  //           if (user) {
	  //               return done(null, user); // user found, return that user
	  //           } else {
	  //               // if there is no user found with that facebook id, create them
	  //               var newUser = new User();

			// 		// set all of the facebook information in our user model
			// 	    newUser._id      = profile.id; // set the users facebook id	                
	  //               newUser.fb.id    = profile.id; // set the users facebook id	                
	  //               newUser.fb.access_token = access_token; // we will save the token that facebook provides to the user	                
	  //               newUser.fb.firstName  = profile.name.givenName;
	  //               newUser.fb.lastName = profile.name.familyName; // look at the passport user profile to see how names are returned

	  //               newUser.fb.email = 'rajeev@gmail.com'//profile.emails[0].value; // facebook can return multiple emails so we'll take the first

			// 		// save our user to the database



	  //               newUser.save(function(err) {
	  //                   if (err)
	  //                       throw err;

	  //                   // if successful, return the new user
	  //                   return done(null, newUser);
	  //               });
	  //           }

			// });
			

        //});

    }));

};
