var express = require('express');
var router = express.Router();
const path = require('path');

var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated())
		return next();
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/');
}

module.exports = function(passport){

	/* GET login page. */
	router.get('/', function(req, res) {
    	// Display the Login page with any flash message, if any
   		res.sendFile(path.join(__dirname+'/index.html'));
		//res.render('index', { message: req.flash('message') });
	});

	/* Handle Login POST */
	router.post('/login', passport.authenticate('login', {
		successRedirect: '/passport/home',
		failureRedirect: '/passport',
		failureFlash : true  
	}));

	/* GET Registration Page */
	router.get('/signup', function(req, res){
		res.render('register',{message: req.flash('message')});
	});

	/* Handle Registration POST */
	router.post('/signup', passport.authenticate('signup', {
		successRedirect: '/passport/home',
		failureRedirect: '/passport/signup',
		failureFlash : true  
	}));


	/* GET Home Page */
	router.get('/home', isAuthenticated, function(req, res){
		res.render('home', { user: req.user });
	});


	/* GET LinkedIn Page */
	router.get('/linkedin', isAuthenticated, function(req, res){
		res.render('linkedin', { user: req.user });
	});

	/* Handle Logout */
	router.get('/signout', function(req, res) {
		req.logout();
		res.redirect('/passport');
	});

	// route for facebook authentication and login
	// different scopes while logging in
	router.get('/login/facebook', 
		passport.authenticate('facebook', { scope : 'email' }
	));

	// handle the callback after facebook has authenticated the user
	router.get('/login/facebook/callback',
		passport.authenticate('facebook', {
			successRedirect : '/passport/facebook',
			failureRedirect : '/passport'
		})
	);
	/* GET Facebook Page */
	router.get('/facebook', isAuthenticated, function(req, res){
		res.render('facebook', { user: req.user });
	});



	// route for google authentication and login
	// different scopes while logging in
	router.get('/login/google', 
		passport.authenticate('google', { scope: 'profile' }
	));

	// handle the callback after google has authenticated the user
	router.get('/login/google/callback',
		passport.authenticate('google', {
			successRedirect : '/passport/google',
			failureRedirect : '/passport'
		})
	);
	/* GET Google Page */
	router.get('/google', isAuthenticated, function(req, res){
		res.render('google', { user: req.user });
	});


	// route for linkedin authentication and login
	// different scopes while logging in
	router.get('/login/linkedin', 
		passport.authenticate('linkedin')
	);

	// handle the callback after linkedin has authenticated the user
	router.get('/login/linkedin/callback',
		passport.authenticate('linkedin', {
			successRedirect : '/passport/linkedin',
			failureRedirect : '/passport'
		})
	);


	/* GET linkedin Page */
	router.get('/linkedin', isAuthenticated, function(req, res){
		res.render('linkedin', { user: req.user });
	});


	// route for twitter authentication and login
	// different scopes while logging in
	router.get('/login/twitter', 
		passport.authenticate('twitter'));

	// handle the callback after twitter has authenticated the user
	router.get('/login/twitter/callback',
		passport.authenticate('twitter', {
			successRedirect : '/passport/twitter',
			failureRedirect : '/passport'
		})
	);

	/* GET Twitter View Page */
	router.get('/twitter', isAuthenticated, function(req, res){
		res.render('twitter', { user: req.user });
	});


	/* GET local page. */
	router.get('/local', function(req, res) {
    	// Display the Login page with any flash message, if any
   		res.sendFile(path.join(__dirname+'/local.html'));
		//res.render('index', { message: req.flash('message') });
	});


	router.get('/login/local', passport.authenticate('local', { session: false }),
	    function(req, res) {
	        res.send(req.user);
	    }
	);



	return router;
}
