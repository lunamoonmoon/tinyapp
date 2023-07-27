//server set up
const express = require("express"); //creates new instance of express framework
const app = express(); //executes express function
const cookieParser = require('cookie-parser') //parse cookie header populate req.cookies wuth object
const PORT = 8080; // default port 8080
import { urlDatabase } from "./database"; //import database obj
import { generateRandomString } from "./helperFunctions"; //import function

//middleware for human readability
app.use(express.urlencoded({ extended: true })); //converts binary into readable data
app.set("view engine", "ejs"); //set view/template engine for rendering templates
app.use(cookieParser()); //use cookie obj middleware

//delete url
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]; //delete specified url
  res.redirect("/urls") //return to list of urls
});

//new short url
app.get("/urls/new", (req, res) => { //route renders template for user to shorten new url
  res.render("urls_new");
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

//update url
app.post("/urls/:id", (req, res) => {
  const editURL = urlDatabase[req.params.id];
  urlDatabase[req.params.id] = req.body.editURL; //update value of stored long URL
  res.redirect("/urls");
});

//register
app.get("/register", (req, res) => {
  res.render("urls_register")
});

// app.post("/register", (req, res) => {
//   const id = generateRandomString;
//   const usernameLogin = req.body.email;
//   const passwordLogin = req.body.password;
//   //what if register without email/password
//   if (!usernameLogin || !passwordlogin || users.username fix this) {
//     res.status(404)
//   } else {
//       users[generateRandomString] = {id, usernameLogin, passwordLogin};
//   };
//   //what if email already matches a user
//   //set userid cookie and use to lookup in users obj
//   //pass user obj to templates
//   return res.redirect("/urls");
// });

//login
app.get("/login", (res, req) =>{
  res.render("/urls_login")
});

app.post("/login", (req, res) => {
  const usernameLogin = userLookup(req.body.email);
  const passwordLogin = req.body.password;
  if(usernameLogin && usernameLogin.password === passwordLogin) {
    res.cookie("user_id", usernameLogin.id)
    return res.redirect("/");
  }
  return res.status(400).send("Your username or password is incorrect");
});

//logout button
app.post("/logout", (req, res) => {
  res.clearCookie("user_id"); //clear username cookie
  res.redirect("/login");
});

//add new url
app.post("/urls", (req, res) => { //route handler for post reqs to /urls
  const randomString = generateRandomString(); //create a unique id for short url id
  urlDatabase[randomString] = req.body.longURL; //add id and long url to database
  res.redirect("/urls/" + randomString); //redirect when post req received
});

app.get("/urls", (req, res) => { //shows list of all urls in database
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["user_id"],
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
