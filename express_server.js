const express = require("express");
const app = express();
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const { getUserByEmail } = require('../helpers.js');

//MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); //console logs the request that comes on terminal
app.use(cookieSession({ name: 'session', keys: ['key1', 'key2'] }));
app.set("view engine", "ejs");

//PASSWORD ENCRYPTION
const password = "wowitsgreat"; // found in the req.body object
const hashedPassword = bcrypt.hashSync(password, 10);

// DATABASE FOR URLS
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


// generates random string of letters + numbers to create a short URL
function generateRandomString() {
  const alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < 6; i++) {
    result += alphanumeric.charAt(Math.floor(Math.random() * alphanumeric.length));
  }

  return result;
}


// USER
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




// MY URLS
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
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

// DELETE URL
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});



// REGISTRATION PAGE
app.get('/register', (req, res) => {
  res.render('urls_registration');
});

function getUserByEmail(email) {
  for (const id in users) {
    const user = users[id];
    if (user.email === email) {
      return user;
    }
  }
  return null;
}

// USER REGISTRATION 
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  const existingUser = getUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ error: 'Email already exists' });
  }
  const user = {
    id: generateRandomString(),
    email,
    password: bcrypt.hashSync(password, 10),
  };
  users[user.id] = user;
  req.session.user_id = user.id;
  res.redirect('/urls');
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
  const shortURL = generateRandomString(); // generate a new short URL
  urlDatabase[shortURL] = req.body.longURL; // save the id-longURL pair to urlDatabase
  res.redirect(`/urls/${shortURL}`); // redirect the user to the new short URL's page
});

// 
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});





// LOGIN
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email);

  if (user === null || !bcrypt.compareSync(password, user.password)) {
    res.status(403).send('Invalid email or password');
  } else {
    req.session.user_id = user.id;
    res.redirect('/urls');
  }
});


// LOGIN PAGE
app.get("/login", (req, res) => {
  const templateVars = {
    userID: null,
    user: users[req.session.userID],
  };
  res.render("urls_login", templateVars);
});


// USER LOGIN
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let user = null;

  // Find the user with the given email and password in the users object
  for (const userId in users) {
    const u = users[userId];
    if (u.email === email && u.password === password) {
      user = u;
      break;
    }
  }

  // if the user does not exist, send error
  if (user === null) {
    res.status(403).send('Invalid email or password');
  } else {
    res.cookie('user_id', user.id);
    res.redirect('/urls');
  }
});

// LOGOUT
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});


app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});