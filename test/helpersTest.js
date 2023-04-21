const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "april", 
    email: "april@showers.com", 
    password: "aprilshowers"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "may@flowers.com", 
    password: "mayflowers",
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user.id,expectedOutput);
  });

  it('should return undefined if the email is not valid', function() {
    const user = getUserByEmail("user3@example.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user,expectedOutput);
  });

});