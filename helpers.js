
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
  const userUrls = {};
  for (let user of db) {
    if (user.id === id) {
      for (let url of user.url) {
        userUrls[url.shortURL] = url.longURL;
      }
    }
  }
  return userUrls;
};



//remember user by their email
function getUserByEmail(email, USERS) {
  for (let user of USERS) {
    if (user.email === email) {
      return user;
    }
  }
  return null;
  // for (const id in USERS) {// users is not defined?
  //   const user = USERS[id];
  //   if (user.email === email) {
  //     return user;
  //   }
  // }
  // return null;
}

const getUser = function (id, USERS) {
  for (const user of USERS) {
    if (user.id === id) {
      return user;
    }
  }
  return null;
};

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };
// for (let key in urlDatabase) {
//   if (id === urlDatabase[key].userID) {
//     filteredDB[key] = urlDatabase[key];
//   }
//   return filteredDatabase;
// }

const deleteUrl = (id, shortURL, db) => {
 for (let user of db) {
    if (user.id === id) {
      const urls = user.url;
      const index = urls.findIndex(url => url.shortURL === shortURL);
      if (index !== -1) {
        urls.splice(index, 1);
        return true;
      }
    }
  }
  return false; 
};
const updateUrl = (id, shortURL, db, newUrl) => {
  for (let user of db) {
    if (user.id === id) {
      const urls = user.url;
      const url = urls.findIndex(url => url.shortURL === shortURL);
      if (url !== -1) {
        urls[url].longURL = newUrl;
        return true;
      }
    }
  }
};



module.exports = {
  generateRandomString,
  findEmail,
  findPassword,
  findUserID, 
  urlsForUser, 
  getUserByEmail, 
  getUser,
  deleteUrl,
  updateUrl,
};