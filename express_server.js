const express = require('express');
const app = express();
const PORT = 8080;
const morgan = require('morgan');
const getUserByEmail = require('./helpers.js');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

//MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev')); //console logs the request that comes on terminal
app.use(cookieSession({ name: 'session', keys: ['key1', 'key2'] }));
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

//DATABASE FOR URLS
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

