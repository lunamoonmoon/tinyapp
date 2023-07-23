//server set up
const express = require("express"); //creates new instance of express framework
const app = express(); //executes express function
const PORT = 8080; // default port 8080

//middleware for human readability
app.use(express.urlencoded({ extended: true })); //converts binary into readable data
app.set("view engine", "ejs"); //set view/template engine for rendering templates

const urlDatabase = { //create database object to store url mappings
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() { //create random 6 digit number string for short url
  let uniqueId = [];
  for(let i = 0; i < 6; i++) { //loop up to six digits
    uniqueId.push(Math.floor(Math.random() * 10)); //number between 0 and 9
  }
  return uniqueId.join(""); //make array a string
}

app.get("/urls/new", (req, res) => { //route renders template for user to shorten new url
  res.render("urls_new");
});

app.post("/urls", (req, res) => { //route handler for post reqs to /urls
  const randomString = generateRandomString(); //create a unique id for short url id
  urlDatabase[randomString] = req.body.longURL; //add id and long url to database
  res.redirect("/urls/:" + randomString); //redirect when post req received
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (longURL) {
    res.redirect(longURL); //if url in database redirect to page
  } else {
    res.status(404); //if not found send error message
  }

});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]}; //Uses the id from route parameter to lookup associated longURL from the urlDatabase
  res.render("urls_show", templateVars); //generates html
});

app.get("/urls", (req, res) => { //shows list of all urls in database
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars); //renders a view, sends html string to client
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => { //listen goes last
  console.log(`Example app listening on port ${PORT}!`);
});
