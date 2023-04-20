const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));




const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



//generates random string of letters + numbers to create a short URL

function generateRandomString() {
  const alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < 6; i++) {
    result += alphanumeric.charAt(Math.floor(Math.random() * alphanumeric.length));
  }

  return result;
}





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

  if (user === null) {
    res.status(403).send('Invalid email or password');
  } else {
    res.cookie('user_id', user.id);
    res.redirect('/urls');
  }
});


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.user_id]
  };
  res.render("urls_index", templateVars);
});

app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    username: req.cookies.username
  };
  const longURL = urlDatabase[templateVars.id];
  templateVars.longURL = longURL;
  res.render('urls_show', templateVars);
});

app.get('/register', (req, res) => {
  res.render('urls_registration');
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies.username
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(); // generate a new short URL
  urlDatabase[shortURL] = req.body.longURL; // save the id-longURL pair to urlDatabase
  res.redirect(`/urls/${shortURL}`); // redirect the user to the new short URL's page
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

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

  if (user === null) {
    res.status(403).send('Invalid email or password');
  } else {
    res.cookie('user_id', user.id);
    res.redirect('/urls');
  }
});


app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});


app.use((req, res, next) => {
  res.locals.username = req.cookies.username;
  next();
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

