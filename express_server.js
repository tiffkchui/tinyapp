const express = require("express");
const app = express();
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');

const {
  generateRandomString,
  urlsForUser,
  getUser,
  getUserByEmail,
  deleteUrl,
  updateUrl,
} = require("./helpers.js");

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

const USERS = [
  {
    id: 'april',
    email: 'april@showers.com',
    // hash for -> 'aprilshowers'
    password: '$2a$10$uDLh0s0Jck6AWT0mG2xIju82RSrSiXBlqSWr2cJyVuFE3CTXz5RZ2'
  },
  {
    id: 'may',
    email: 'may@flowers.com',
    // hash for -> 'mayflowers'
    password: '$2a$10$oJys2o47KC5WpBX6bFIV0.aeJzHW4ySCPy6hgDMcxlXym/MlY8UBe',
  }
];
const URLDATABASE = [
  {
    id: 'april',
    url: [
      {
        shortURL: 'b2xVn2',
        longURL: 'https://www.lighthouselabs.ca',
      },
      {
        shortURL: '9sm5xK',
        longURL: 'https://www.google.com/',
      },
    ]
  },
  {
    id: 'may',
    url: [
      {
        shortURL: 'Rxsw2a',
        longURL: 'https://www.maytestexample.com',
      },
      {
        shortURL: 'fow3r4',
        longURL: 'https://www.mayexample.com/',
      },
    ]
  }
];
//HOMEPAGE
app.get('/', (req, res) => {
  res.redirect('login');
})
app.get('/login', (req, res) => {
  res.render('urls_login', { email : ''});
})
// LOGIN
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Please fill in all fields.');
  }
  const user = getUserByEmail(email, USERS);
  if (!user) return res.status(403).send('Email not found.');

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send('Incorrect password.');
  }

  req.session.user_id = user.id;
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  console.log(req.session.user_id);
  const id = req.session.user_id;
  if (!id) return res.redirect('/login');
  const user = getUser(id, USERS);
  // response html with no user found
  if (!user) return res.redirect('/login');

  const filteredDataBase = urlsForUser(id, URLDATABASE);

  const templateVars = {
    email: user.email,
    user_id: user.id,
    urls: filteredDataBase,
  };
  res.render('urls_index', templateVars);
});

// GET LONG URL FROM SHORT URL ID
app.get("/urls/:id", (req, res) => {
  // if a user is not logged in, redirect to login page
  if (!req.session.user_id ) return res.redirect('/login');
  const user_id = req.session.user_id;
  const urlDatabase = urlsForUser(user_id, URLDATABASE);
  const urlObject = urlDatabase[req.params.id];


  const getUserEmailBasedOnId = (id) => {
    // loop through users
    for (const user of USERS) {
      // if user id matches id passed in, return email
      if (user.id === id) {
        return user.email;
      }
    }
  };
  const email = getUserEmailBasedOnId(user_id) || 'no email';
  const templateVars = {
    email: email,
    id: req.params.id,
    user: req.session.user
  };
  // const urlDatabase = urlsForUser(req.session.user_id, URLDATABASE);
  const longURL = urlDatabase[templateVars.id];
  templateVars.longURL = longURL;
  res.render('urls_show', templateVars);
});
// DELETE URL
app.post('/urls/:id/delete', (req, res) => {
  if (!req.session.user_id) {
    const templateVars = {
      email: 'NON-EXISTENT',
      msg: 'NON-EXISTENT'
    };
    res.render('error', templateVars);
    return;
  }
  const id = req.params.id;
  deleteUrl(req.session.user_id, id, URLDATABASE);
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  const shortUrl = req.body.shortURL;
  const user_id = req.session.user_id;
  if (shortUrl === 'new') {
    const shortUrl = generateRandomString();
    console.log(shortUrl);
    URLDATABASE.push({ id: user_id, url: [{ shortURL: shortUrl, longURL: longURL }] });
    return res.redirect(`/urls`);
  }
  if (!user_id) return res.redirect('/login');

  console.log(user_id, shortUrl, URLDATABASE, longURL);
  updateUrl(user_id, shortUrl, URLDATABASE, longURL);
  res.redirect(`/urls`);
});

app.get('/register', (req, res) => {
  res.render('urls_registration', { email: ''});
});
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, USERS);
  if (user) return res.status(400).send('Email already exists.');

  const id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);
  USERS.push({ id, email, password: hashedPassword });
  req.session.user_id = id;
  res.redirect('/urls');
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const urlObject = URLDATABASE.find(url => url.url.find(url => url.shortURL === shortURL));
  if (!urlObject) {
    const templateVars = {
      email: 'NON-EXISTENT',
      msg: 'NON-EXISTENT'
    };
    res.render('error', templateVars);
    return;
  } else {
    const longURL = urlObject.url.find(url => url.shortURL === shortURL).longURL;
    res.redirect(longURL);
  }
});
// LOGOUT
app.post('/logout', (req, res) => {
    // Clear the user's session cookie to log them out
  req.session.user_id = null;
  // Redirect the user to the login page
  res.redirect('/login');
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});