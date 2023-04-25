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

//USER
const users = {
  userRandomID: {
    id: "april",
    email: "april@showers.com",
    password: "aprilshowers",
  },
  user2RandomID: {
    id: "may",
    email: "may@flowers.com",
    password: "mayflowers",
  },
};

//PASSWORD ENCRYPTION
const password = "wowitsgreat"; // found in the req.body object
const hashedPassword = bcrypt.hashSync(password, 10);


//HOMEPAGE
app.get('/', (req, res) => {
  res.redirect('login');
});


//URLS

app.get('/urls', (req, res) => {
  const user = getUser(req);
  if (!user) {
    res.send('401 ERROR: Unauthorised. Please log in to view page.');
    return;
  }

  const filteredDatabase = urlsForUser(user.id);

  const templateVars = {
    user_id: users[req.session['user_id']],
    user: user,
    urls: filteredDatabase,
  };
  res.render('urls_index', templateVars);
});

// SHORT URL GENERATOR PAGE
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: req.session.user
  };
  res.render("urls_new", templateVars);
});

// GENERATES SHORT URLS FROM LONG URLS
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.send('Error: Please log in to access.');
  }

  const shortURL = generateRandomString(); // generate a new short URL
  urlDatabase[shortURL] = req.body.longURL; // save the id-longURL pair to urlDatabase
  res.redirect('/urls'); // redirect the user to the new short URL's page
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// GET LONG URL FROM SHORT URL ID
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    user: req.session.user
  };
  const longURL = urlDatabase[templateVars.id];
  templateVars.longURL = longURL;
  res.render('urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  // Update the longURL of the specified ID in the database
  urls[id].longURL = longURL;
  // Redirect the user to the /urls page
});
if (!req.session.user_id) {
  const templateVars = {
    msg: 'Error: Non-existent. Please try again.'
  };
  res.render('error', templateVars);
  res.redirect('/urls');
};



