//server set up
const express = require("express"); //creates new instance of express framework
const app = express(); //executes express function
const cookieSession = require('cookie-session'); //parse cookie header populate req.cookies wuth object
const bcrypt = require("bcryptjs"); //encrypting package
const PORT = 8080; // default port 8080

const {users, urlDatabase} = require("./database"); //import users and urlDatabase objs
const {generateRandomString, userLookup, urlsForUser} = require("./helperFunctions"); //import helper functions

//middleware for human readability
app.use(express.urlencoded({ extended: true })); //converts binary into readable data
app.use(cookieSession({name: 'session', keys: ['key1', 'key2'] })); //cookie middleware stores session data client side within a cookie
app.set("view engine", "ejs"); //set view/template engine for rendering templates

//delete url
app.post("/urls/:id/delete", (req, res) => {
  if (!req.session.user_id) { //if user id's don't match
    return res.status(400).send("Please login first")
  };

  const url = urlDatabase[req.params.id];
  if (!url) {
    return res.status(400).send("Short url doesn't exist")
  };

  if (url.userID !== req.session.user_id) { //if user id's don't match
    return res.status(400).send("Sorry this url isn't yours")
  };

  delete urlDatabase[req.params.id]; //delete specified url
  res.redirect("/urls") //return to list of urls
});

//edit short url
app.get("/urls/:id/edit", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(400).send("Short URL doesn't exist");
  }

  const templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: req.session.user_id
  };
  res.render("urls_edit", templateVars);
});

app.post("/urls/:id/edit", (req, res) => {
if(!urlDatabase[req.params.id]) {
    return res.status(400).send("Short URL doesn't exist");
  }

  urlDatabase[req.params.id].longURL = req.body.newURL; //update value of stored long URL

  res.redirect("/urls");
});

//new short url
app.get("/urls/new", (req, res) => { //route renders template for user to shorten new url
  if (!req.session.user_id) { //if not logged in
    return res.redirect("/login");
  };
  const templateVars = {
    user: req.session.user_id,
  };
  res.render("urls_new", templateVars);
});

//access short url
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (longURL) {
    res.redirect(longURL); //if url in database redirect to page
  } else {
    res.status(404).send("URL not found"); //if not found send error message
  };
});

app.get("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    return res.status(400).send("Please login first")
  };

  const shortURL = req.params.id;
  const url = urlDatabase[shortURL];

  if (!url) { //if id isn't found
    return res.status(400).send("Short url doesn't exist")
  };
  if (url.userID !== req.session.user_id) { //if user id's don't match
    return res.status(400).send("Sorry this url isn't yours")
  };

  const templateVars = {
    id: shortURL,
    shortURL: shortURL,
    longURL: url.longURL,
    user: req.session.user_id
  }; //Uses the id from route parameter to lookup associated longURL from the urlDatabase

  res.render("urls_show", templateVars); //generates html
});

//update url
app.post("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    return res.status(400).send("Please login first")
  };
  if (!urlDatabase[req.params.id]) {
    return res.status(400).send("Short url doesn't exist")
  };
  if (!req.session.user_id || urlDatabase[randomString].userID !== req.session.user_id) { //if user id's don't match
    return res.status(400).send("Sorry this url isn't yours")
  };
  urlDatabase[req.params.id].longURL = req.body.newURL; //update value of stored long URL
  res.redirect("/urls");
});

//register
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls"); //if logged in redirect
  };
  const templateVars = {
    user: null,
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body
  if (!email || !password) { //if username or password empty
    return res.status(400).send("Please enter an email and password");
  }

  const emailExists = userLookup(email)
  if (emailExists) { //if the email is already registered
    return res.status(400).send("Please login, email already registered");
  }

  const id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  users[id] = {id, email , password: hashedPassword}; //log to usesrs obj

  req.session.user_id = id; //set cookie
  res.redirect("/urls");
});

//login
app.get("/login", (req, res) =>{
  if (req.session.user_id) { //if logged in
    return res.redirect("/urls");
  };
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("urls_login", templateVars) //pass user_id to header template
});

app.post("/login", (req, res) => {
  const usernameLogin = userLookup(req.body.email);

  if(!usernameLogin) {
    return res.status(403).send("That email does not have an account");
  };
  if(!bcrypt.compareSync(req.body.password, usernameLogin.password)) {
    return res.status(403).send("Your username or password is incorrect");
  };
  req.session.user_id = usernameLogin.id;
  return res.redirect("/urls");
});

//logout button
app.post("/logout", (req, res) => {
  req.session = null; //end session clear cookies
  res.redirect("/login");
});

//add new url
app.post("/urls", (req, res) => { //route handler for post reqs to /urls
  if (!req.session.user_id) {
    return res.status(400).send("Please login to shorten URLs")
  };

  randomString = generateRandomString();
  urlDatabase[randomString] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  }; //add long url and user id to database in random string obj
  res.redirect("/urls/" + randomString); //redirect when post req received
});

app.get("/urls", (req, res) => { //shows list of all urls in database
  if (!req.session.user_id) {
    return res.status(400).send("Please login to view your shortened urls");
  };
  const templateVars = {
    urls: urlsForUser(req.session.user_id),
    user: users[req.session.user_id],
    shortURL: generateRandomString(),
  };
  res.render("urls_index", templateVars); //renders a view, sends html string to client
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/", (req, res) => { //route renders template based on login status
  if (!req.session.user_id) { //if not logged in
    return res.redirect("/login");
  } else {
    return res.redirect("/urls");
  };
});

app.listen(PORT, () => { //listen goes last
  console.log(`Example app listening on port ${PORT}!`);
});
