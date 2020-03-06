var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var User = require('../schema/api/user');
var localConfig = require('../config.js');
var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;


var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = localConfig.secretKey;
 opts.issuer = 'accounts.examplesoft.com';
 opts.audience = 'yoursite.net';

module.exports = function(passport) {

		console.log('localConfig--',localConfig)
		console.log('opts--',opts)

		passport.use('local', new JwtStrategy(
			opts,
		  function(jwt_payload, done) {

		    console.log('jwt_payload 1---',jwt_payload)

		    User.findOne({_id: jwt_payload.sub}, function(err, user) {
		        if (err) {
		            return done(err, false);
		        }
		        if (user) {
		            return done(null, user);
		        } else {
		        	console.log('jwt_payload 2---',jwt_payload)
		            return done(null, false);
		            // or you could create a new account
		        }
		    });
		}));
	  // asynchronous verification, for effect...
	  // process.nextTick(function () {

			// // find the user in the database based on their facebook id


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
	  //                var newUser = new User();

			// 		// set all of the facebook information in our user model
   // 			        newUser._id      = profile.id; // set the users facebook id	                
	  //               newUser.linkedin.id    = profile.id; // set the users facebook id	                
	  //               newUser.linkedin.access_token = access_token; // we will save the token that facebook provides to the user	                
	  //               newUser.linkedin.firstName  = profile.name.givenName;
	  //               newUser.linkedin.lastName = profile.name.familyName; // look at the passport user profile to see how names are returned
	  //               newUser.linkedin.email = profile.emails.length> 0 ? profile.emails[0].value : '' //profile.emails[0].value; // facebook can return multiple emails so we'll take the first
	  //               newUser.linkedin.profile_pic = profile.photos.length> 0 ? profile.photos[0].value : '' //profile.emails[0].value; // facebook can return multiple emails so we'll take the first

			// 		// save our user to the database
	  //               newUser.save(function(err) {
	  //                   if (err)
	  //                       throw err;

	  //                   // if successful, return the new user
	  //                   return done(null, newUser);
	  //               });
	  //           }

			// });

	  // });
	//}

    //));

};
