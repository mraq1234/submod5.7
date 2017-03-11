var path = require('path');
var express = require('express');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var config = require('./config');
var errorHandler = require('express-error-handler/error-handler.js');
var app = express();
var googleProfile = {};

passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

passport.use(new GoogleStrategy({
        clientID: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        callbackURL: config.CALLBACK_URL
    },
    function(accessToken, refreshToken, profile, cb) {
        googleProfile = {
            id: profile.id,
            displayName: profile.displayName
        };
        cb(null, profile);
    }
));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res) {
    console.log('user: ', req.user);
    res.render('index', { user: req.user });
});

app.get('/logged', function(req, res) {
    res.render('index', { user: googleProfile });
});

app.get('/logout', function(req, res) {
    req.logout();
    delete req.session;
    res.redirect("https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=http://localhost:3000");
});

app.get('/auth/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    }));

app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/logged',
        failureRedirect: '/'
    }));

app.use(errorHandler({ server: server }));

var server = app.listen(3000);