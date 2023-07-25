export function generateRandomString() { //create random 6 digit number string for short url
  let uniqueId = [];
  for(let i = 0; i < 6; i++) { //loop up to six digits
    uniqueId.push(Math.floor(Math.random() * 10)); //number between 0 and 9
  }
  return uniqueId.join(""); //make array a string
}