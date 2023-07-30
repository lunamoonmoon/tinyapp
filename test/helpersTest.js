const { assert } = require('chai');

const { userLookup } = require('../helperFunctions.js');

const testUsers = {
  "userRandomID": {
    userID: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    userID: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = userLookup("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID);
  });
  it('should return null when email doesn\'t exists in database', function() {
    const notUser = userLookup("notuser@mail.com", testUsers);
    assert.equal(notUser, null);
  });
});
