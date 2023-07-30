//server set up
const express = require("express"); //creates new instance of express framework
const app = express(); //executes express function
const cookieParser = require('cookie-parser') //parse cookie header populate req.cookies wuth object
const PORT = 8080; // default port 8080

const {users, urlDatabase} = require("./database"); //import users and urlDatabase objs
const {generateRandomString, userLookup, urlsForUser} = require("./helperFunctions"); //import helper functions

//middleware for human readability
app.use(express.urlencoded({ extended: true })); //converts binary into readable data
app.set("view engine", "ejs"); //set view/template engine for rendering templates
app.use(cookieParser()); //use cookie obj middleware

//delete url
app.post("/urls/:id/delete", (req, res) => {
  if (!urlDatabase.req.params.id) {
    return res.status(400).send("Short url doesn't exist")
  };
  if (!req.cookies["user_id"] || urlDatabase.req.cookies["user_id"] !== req.cookies["user_id"]) { //if user id's don't match
    return res.status(400).send("Sorry this url isn't yours")
  };
  delete urlDatabase[req.params.id]; //delete specified url
  res.redirect("/urls") //return to list of urls
});

//new short url
app.get("/urls/new", (req, res) => { //route renders template for user to shorten new url
  if (!req.cookies["user_id"]) { //if not logged in
    return res.redirect("/login");
  };
  const templateVars = {
    user_id: req.cookies["user_id"],
  };
  res.render("urls_new", templateVars);
});

//access short url
app.get("/u/:id", (req, res) => {
  if (!req.cookies["user_id"]) { //if user not logged in
    return res.status(400).send("Please login to access short urls")
  };
  if (urlDatabase[req.params.id].userID !== req.cookies["user_id"]) { //if user id's don't match
    return res.status(400).send("Sorry this url isn't yours")
  };
  const longURL = urlDatabase[req.params.id].longURL;
  if (longURL) {
    res.redirect(longURL); //if url in database redirect to page
  } else {
    res.status(404); //if not found send error message
  };
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user_id: req.cookies["user_id"],
  }; //Uses the id from route parameter to lookup associated longURL from the urlDatabase
  res.render("urls_show", templateVars); //generates html
});

//update url
app.post("/urls/:id", (req, res) => {
  if (!urlDatabase.req.params.id) {
    return res.status(400).send("Short url doesn't exist")
  };
  if (!req.cookies["user_id"] || urlDatabase.req.params.id.req.cookies["user_id"] !== req.cookies["user_id"]) { //if user id's don't match
    return res.status(400).send("Sorry this url isn't yours")
  };
  urlDatabase[req.params.id].longURL = req.body.longURL; //update value of stored long URL
  res.redirect("/urls");
});

//register
app.get("/register", (req, res) => {
  if (req.cookies["user_id"]) {
    return res.redirect("/urls"); //if logged in redirect
  };
  const templateVars = {
    urls: urlDatabase,
    user_id: req.cookies["user_id"],
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const usernameLogin = req.body.email;
  const passwordLogin = req.body.password;
  if (!usernameLogin || !passwordLogin || userLookup(usernameLogin) !== null) { //if username or password empty or the email is already registered
    res.status(400).send("Invalid registration");
  } else {
  users[id] = {id, email: usernameLogin, password: passwordLogin}; //log to usesrs obj
  res.cookie("user_id", id); //set cookie
  res.redirect("/urls");
  };
});

//login
app.get("/login", (req, res) =>{
  if (req.cookies["user_id"]) { //if logged in
    return res.redirect("/urls");
  };
  const templateVars = {
    user_id: req.cookies["user_id"],
  };
  res.render("urls_login", templateVars) //pass user_id to header template
});

app.post("/login", (req, res) => {
  const usernameLogin = userLookup(req.body.email);
  const passwordLogin = req.body.password;
  if(usernameLogin === null) {
    return res.status(403).send("That email does not have an account");
  };
  if(usernameLogin && usernameLogin.password === passwordLogin) {
    res.cookie("user_id", usernameLogin.id)
    return res.redirect("/urls");
  };
  return res.status(403).send("Your username or password is incorrect");
});

//logout button
app.post("/logout", (req, res) => {
  res.clearCookie("user_id"); //clear username cookie
  res.redirect("/login");
});

//add new url
app.post("/urls", (req, res) => { //route handler for post reqs to /urls
  if (!req.cookies["user_id"]) {
    return res.status(400).send("Please login to shorten URLs")
  };
  const randomString = generateRandomString(); //create a unique id for obj in database
  urlDatabase[randomString] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"],
  }; //add long url and user id to database in random string obj
  res.redirect("/urls/" + randomString); //redirect when post req received
});

app.get("/urls", (req, res) => { //shows list of all urls in database
  if (!req.cookies["user_id"]) {
    return res.status(400).send("Please login to view your shortened urls");
  };
  const templateVars = {
    urls: urlsForUser(req.cookies["user_id"]),
    user_id: req.cookies["user_id"],
  };
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
