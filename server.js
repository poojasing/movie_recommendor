const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const hbs = require("hbs");
const session = require("express-session");
var firebase = require("firebase-admin");
var serviceAccount = require("./sk.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://mrsystem-54a36.firebaseio.com",
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set("views", __dirname + "/views");
app.set("view engine", "hbs");
app.use(express.static("./public"));
app.use(
  session({
    secret: "j34H5+lNYNLmpFD5mUUSDg5M/bL5g+tmiRfeCt6L2hg=",
    resave: false,
    saveUninitialized: false,
  })
);

var sess;

app.get("/", (req, res) => {
  res.render("login");
});

app.post("/", (req, res) => {
  sess = req.session;
  sess.username = req.body.username;
  sess.password = req.body.password;

  if (sess.username && sess.password) {
    var ref = firebase.database().ref("Auth");
    ref.on("value", function (snapshot) {
      if (snapshot.hasChild(sess.username)) {
        var reff = firebase.database().ref("Auth/" + sess.username);
        reff.on("value", function (snapshot) {
          if (
            snapshot.val().username === sess.username &&
            snapshot.val().password === sess.password
          ) {
            res.redirect("/choice");
          } else {
            res.redirect("/");
          }
        });
      }
    });
  } else {
    res.redirect("/");
  }
});

app.get("/logout", (req, res) => {
  sess = req.session;
  sess.destroy();
  res.redirect("/login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", (req, res) => {
  var username = req.body.username;
  var password = req.body.password;

  if (username && password) {
    firebase
      .database()
      .ref("Auth/" + username)
      .set({
        username: username,
        password: password,
      });
    res.redirect("/");
  } else {
    res.redirect("/signup");
  }
});

app.get("/welcome", (req, res) => {
  res.render("welcome");
});

app.get("/movieAdd", (req, res) => {
  res.render("movieAdd");
});

app.get("/choice", (req, res) => {
  res.render("choice");
});

app.post("/choice", (req, res) => {
  var action = req.body.action;
  var comedy = req.body.comedy;
  var scifi = req.body.scifi;

  sess = req.session;

  var arr = [];
  sess.movieDetails = [];
  if (action && comedy) {
    var ref = firebase.database().ref("Movies");
    ref.once("value", (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        arr = childSnapshot.val().category.split(/\s*,\s*/);
        var n = arr.length;
        var flag = 0;
        console.log(n);
        console.log(arr);
        for (var i = 0; i < n; i++) {
          if (arr[i] === "action" || arr[i] === "comedy") {
            flag = 1;
            break;
          }
        }
        if (flag == 1) {
          sess.movieDetails.push({
            image_url: childSnapshot.val().image_url,
            name: childSnapshot.val().name,
            language: childSnapshot.val().language,
            date: childSnapshot.val().date,
            duration: childSnapshot.val().duration,
            time: childSnapshot.val().time,
            movieKey: childSnapshot.key,
          });
        }
      });
      console.log(sess.movieDetails);
      res.redirect("/movies");
    });
  } else if (action && scifi) {
    var ref = firebase.database().ref("Movies");
    ref.once("value", (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        arr = childSnapshot.val().category.split(/\s*,\s*/);
        var n = arr.length;
        var flag = 0;
        console.log(n);
        console.log(arr);
        for (var i = 0; i < n; i++) {
          if (arr[i] === "action" || arr[i] === "scifi") {
            flag = 1;
            break;
          }
        }
        if (flag == 1) {
          sess.movieDetails.push({
            image_url: childSnapshot.val().image_url,
            name: childSnapshot.val().name,
            language: childSnapshot.val().language,
            date: childSnapshot.val().date,
            duration: childSnapshot.val().duration,
            time: childSnapshot.val().time,
            movieKey: childSnapshot.key,
          });
        }
      });
      console.log(sess.movieDetails);
      res.redirect("/movies");
    });
  } else if (scifi && comedy) {
    var ref = firebase.database().ref("Movies");
    ref.once("value", (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        arr = childSnapshot.val().category.split(/\s*,\s*/);
        var n = arr.length;
        var flag = 0;
        console.log(n);
        console.log(arr);
        for (var i = 0; i < n; i++) {
          if (arr[i] === "scifi" || arr[i] === "comedy") {
            flag = 1;
            break;
          }
        }
        if (flag == 1) {
          sess.movieDetails.push({
            image_url: childSnapshot.val().image_url,
            name: childSnapshot.val().name,
            language: childSnapshot.val().language,
            date: childSnapshot.val().date,
            duration: childSnapshot.val().duration,
            time: childSnapshot.val().time,
            movieKey: childSnapshot.key,
          });
        }
      });
      console.log(sess.movieDetails);
      res.redirect("/movies");
    });
  }
});

app.get("/movies", (req, res) => {
  res.render("movies", {
    movieDetails: sess.movieDetails,
  });
});

app.get("/movieBooking", (req, res) => {
  res.render("movieBooking", {
    movieKey: req.query.key,
    username: sess.username,
  });
});

app.listen(4000, () => {
  console.log("running on port 4000");
});
