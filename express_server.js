const express = require("express");
const app = express();
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');

//CALL UPON FUNCTIONS IN HELPERS.JS
const { generateRandomString, findEmail, findPassword, findUserID, urlsForUser, getUserByEmail, getUser} = require("./helpers.js");


//MIDDLEWARE

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev')); //console logs the request that comes on terminal
app.use(cookieSession({ name: 'session', keys: ['key1', 'key2'] }));
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

//HOMEPAGE
app.get('/', (req, res) => {
  res.redirect('login');
});

//PASSWORD ENCRYPTION
const password = "wowitsgreat"; // found in the req.body object
const hashedPassword = bcrypt.hashSync(password, 10);

// DATABASE FOR URLS
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


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
  
  const user = getUser(req);

  if (!user) {
    res.send("<p>401: ERROR. Unauthorised. Please log in to view page.</p>");
    return;
  }

  const filteredDatabase = urlsForUser(user.id);
  const templateVars = {
    user_id: users[req.session.user_id],
    urls: filteredDatabase,
  };
  res.render('urls_index', templateVars);
});


// SHORT URL GENERATOR PAGE
  

app.get('/u/:id', (req, res) => {
    
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);

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

// 
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

  if (!req.session.userId) {
    const templateVars = {
      msg: 'Error: Non-existent. Please try again.'
    };
    return res.render('error', templateVars);
  }

  // Redirect the user to the /urls page
  res.redirect('/urls');
});

// DELETE URL
app.post('/urls/:id/delete', (req, res) => {
  if (!req.session.userId) {
    const templateVars = {
      msg: 'NON-EXISTENT'
    };
    res.render('error', templateVars);
    return;
  }
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});


// REGISTRATION PAGE
app.get('/register', (req, res) => {
  if (user) {
    res.redirect('/urls');
    return;
  }
  res.render('urls_registration');
});


// USER REGISTRATION

app.post('/register', (req, res) => {
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const UserCredentials = createNewUser(userId, email, password);

  if (!email || !password) {
    return res.status(400).send('Unable to authenticate email or password.');
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
  req.session.userId = user.Id;
  res.redirect('/urls');
});



// LOGIN PAGE
app.get('/login', (req, res) => {
  res.render('urls_login');
});

// LOGIN
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);

  if (user === null || !bcrypt.compareSync(password, user.password)) {
    res.status(403).send('Invalid email or password');
  } else {
    req.session.user_id = user.id;
    res.redirect('/urls');
  }
  if (!email || !password) {
    res.status(403).send('Please fill in the field.');
    return;
  }

if (typeof user === 'undefined') {
  res.status(403).send('Error: incorrect email or password');
  return;
}
if (!bcrypt.compareSync(password, user.password)) {
  res.status(403).send('Error: incorrect email or password. Please try again.');
  return;
};
  req.session.user_id = user.
    res.redirect('/urls');
});



app.get('/urls', (req, res) => {
  const user = getUser(req);
  if (!user) {
    res.send('Error: Not logged in.');
    return;
  }
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const user = getUser(req);
  if (!user) {
    res.redirect('/login');
    return;
  }

  const templateVars = {
    user: user,
    urls: urlDatabase
  };
  res.render('urls_new', templateVars);
});

app.get('/u/:shortURL', (req, res) => {

  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);

});

app.post('/urls', (req, res) => {
  if (!req.session.user_id) {
    res.send('Error: Please log in.');
  }
  const key = generateRandomString();
  urlDatabase[key] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  }; res.redirect('/urls');
});


// LOGOUT
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
