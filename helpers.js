
// how we generate random strings length = 6
const generateRandomString = () => {
  const alphaNumerical = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += alphaNumerical.charAt(Math.floor(Math.random() * alphaNumerical.length));
  }
  return result;
};


//checks if URL is valid input
const isValidHttpUrl = function (string) {
  let url;
  try {
      url = new URL(string);
  } catch (_) {
      return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
};

// check to see if email exist
const findEmail = (email, db) => {
  for (let key in db) {
    if (email === db[key].email) {
      return email;
    }
  }
  return undefined;
};

//check to see if password exist
const findPassword = (email, db) => {
  for (let key in db) {
    if (email === db[key].email) {
      return db[key].password;
    }
  }
  return undefined;
};

// find the id by email
const findUserID = (email, db) => {
  for (let key in db) {
    if (email === db[key].email) {
      return db[key].id;
    }
  }
  return undefined;
};

// returns URL matched with ID
const urlsForUser = (id, db) => {
  const userURLs = {};
  for (let url in db) {
    if (id === db[url].userID) {
      userURLs[url] = db[url];
    }
  }
  return userURLs;
};



//remember user by their email
function getUserByEmail(email) {
  for (const id in users) {
    const user = users[id];
    if (user.email === email) {
      return user;
    }
  }
  return null;
}

const getUser = function(req) {
  const user = req.session.userId ? users[req.session.userId] : null;
  return user;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
  for (let key in urlDatabase) {
    if (id === urlDatabase[key].userID) {
      filteredDB[key] = urlDatabase[key];
    }
    return filteredDatabase;
  }

  



module.exports = { generateRandomString,findEmail, findPassword, findUserID, urlsForUser, getUserByEmail, getUser};