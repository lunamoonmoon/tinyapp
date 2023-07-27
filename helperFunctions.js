const users = require("./database");

function generateRandomString() { //create random 6 digit number string for short url
  let uniqueId = [];
  for(let i = 0; i < 6; i++) { //loop up to six digits
    uniqueId.push(Math.floor(Math.random() * 10)); //number between 0 and 9
  }
  return uniqueId.join(""); //make array a string
};

//lookup email in users obj
function userLookup(email) {
  for(let i in users) {
    if(email === users[i].email) {
      return users[i];
    }
  }
  return null;
};

module.exports = {generateRandomString, userLookup};
