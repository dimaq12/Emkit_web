const express = require('express');
const i18n = require('i18n-2');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const promisify = require('es6-promisify');
const flash = require('connect-flash');
const expressValidator = require('express-validator');
const routes = require('./routes/index');
const helpers = require('./helpers');
const errorHandlers = require('./handlers/errorHandlers');

// create our Express app
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views')); // this is the folder where we keep our pug files
app.set('view engine', 'pug'); // we use the engine pug, mustache or EJS work great too

// serves up static files from the public folder. Anything in public/ will just be served up as the file it is
app.use(express.static(path.join(__dirname, 'public')));

// Takes the raw requests and turns them into usable properties on req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Exposes a bunch of methods for validating data. Used heavily on userController.validateRegister
app.use(expressValidator());

// populates req.cookies with any cookies that came along with the request
app.use(cookieParser());

// -----------------Locale section--------------------------
// Attach the i18n property to the express request object
// And attach helper methods for use in templates
i18n.expressBind(app, {
  // setup some locales - other locales default to en silently
  locales: ['ru', 'en'],
  defaultLocale: 'ru',
  // change the cookie name from 'lang' to 'locale'
  cookieName: 'locale'
});

app.use(function(req, res, next) {
  if (req.cookies.locale === undefined) {
    // console.log('There is no cookie');
    res.cookie('locale', 'ru');
    req.i18n.setLocale('ru');
  } else {
    // console.log(`the current locale is ${req.cookies.locale}`);
  };  
  req.i18n.setLocaleFromCookie();
  next();
});
// -------------------------------------------------------------

// Sessions allow us to store data on visitors from request to request
// This keeps users logged in and allows us to send flash messages
app.use(session({
  secret: process.env.SECRET,
  key: process.env.KEY,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: { maxAge: 60000 }
}));

// // Passport JS is what we use to handle our logins
app.use(passport.initialize());
app.use(passport.session());

// // The flash middleware let's us use req.flash('error', 'Shit!'), which will then pass that message to the next page the user requests
app.use(flash());

// pass variables to our templates + all requests
app.use((req, res, next) => {
  res.locals.h = helpers;
  res.locals.flashes = req.flash();
  res.locals.user = req.user || null;
  res.locals.currentPath = req.path;
  next();
});

// pass menu here because in helpers it's not updating on each page request
app.use((req, res, next) => {
  res.locals.m = [
    { slug: '/stores', title: req.i18n.__("items"), icon: 'store', },
    { slug: '/tags', title: req.i18n.__("categories"), icon: 'tag', },
    { slug: '/top', title: req.i18n.__("top"), icon: 'top', },
    { slug: '/add', title: req.i18n.__("add"), icon: 'add', },
  ];
  res.locals.siteName = req.i18n.__("siteName");
  res.locals.reg = req.i18n.__("register");
  res.locals.log = req.i18n.__("login");
  res.locals.searchPlaceholder = req.i18n.__("searchPlaceholder");
  next();
});

// promisify some callback based APIs
app.use((req, res, next) => {
  req.login = promisify(req.login, req);
  next();
});

// After allllll that above middleware, we finally handle our own routes!
app.use('/', routes);

// If that above routes didnt work, we 404 them and forward to error handler
app.use(errorHandlers.notFound);

// One of our error handlers will see if these errors are just validation errors
app.use(errorHandlers.flashValidationErrors);

// Otherwise this was a really bad error we didn't expect! Shoot eh
if (app.get('env') === 'development') {
  /* Development Error Handler - Prints stack trace */
  app.use(errorHandlers.developmentErrors);
}

// production error handler
app.use(errorHandlers.productionErrors);

// done! we export it so we can start the site in start.js
module.exports = app;
