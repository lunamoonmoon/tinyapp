const express = require("express"); //creates new instance of express framework
const app = express(); //executes express function
const PORT = 8080; // default port 8080

app.use(express.urlencoded({ extended: true })); //converts binary into readable data
app.set("view engine", "ejs"); //set view engine for rendering templates

const urlDatabase = { //create database object
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  let uniqueId = [];
  for(let i = 0; i < 6; i++) {
    uniqueId.push(Math.floor(Math.random() * 10));
  }
  return uniqueId.join("");
}

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  res.send("Ok");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]}; //Uses the id from route parameter to lookup associated longURL from the urlDatabase
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
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
