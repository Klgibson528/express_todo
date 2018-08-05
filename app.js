//look at .fetch API for ajax and calling endpoints
const express = require("express");
const body_parser = require("body-parser");
const app = express();
const pgp = require("pg-promise")({});
const bcrypt = require("bcrypt");
const expressValidator = require("express-validator");
const cookieParser = require("cookie-parser");

 
//Authentication Packages
const session = require("express-session");
const passport = require("passport");

const saltRounds = 10;
const db = pgp(
  process.env.DATABASE_URL || { database: "todo", user: "postgres" }
);

// Templating
const nunjucks = require("nunjucks");
nunjucks.configure("views", {
  autoescape: true,
  express: app,
  noCache: true
});

require("dotenv").config();

//Middleware
app.use(express.static("public"));
app.use(
  body_parser.urlencoded({
    extended: false
  })
);
app.use(expressValidator());
app.use(
  session({
    store: new (require("connect-pg-simple")(session))(),
    // change to env var for production
    secret: "fhyfyygbjhljgyfyhfyhf",
    resave: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
    //if true, cookie is created for anyone visiting page, not just those logged in
    saveUninitialized: false
    // cookie: { secure: true }
  })
);
app.use(require("cookie-parser")());
app.use(passport.initialize());
app.use(passport.session());

app.get("/", function(req, res, next) {
  res.render("signin.html");
});

app.post("/", function(req, resp) {
  var email = req.body.inputEmail1;
  var password = req.body.inputPassword1;
  db.query("SELECT password FROM users WHERE email = ($1)", email).then(
    function(results) {
      var hash = results[0].password;
      if (bcrypt.compareSync(password, hash)) {
        db.query(
          "SELECT userid FROM users WHERE email = ($1) AND password = ($2)",
          [email, hash]
        )
          .then(function(results) {
            console.log(results);
            userid = results[0].userid;
            console.log(userid);
            db.query("SELECT * FROM task WHERE userid = ($1)", userid)
              .then(function(results) {
                resp.render("todolist.html", {
                  results: results
                });
              })
              .catch(function(err) {
                resp.send("ERROR 1");
              });
          })
          .catch(function(err) {
            resp.send("ERROR 2");
          });
      } else {
        console.log("false");
      }
    }
  );
});

app.get("/signup", function(req, res, next) {
  res.render("signup.html");
});

app.post("/signup", function(req, resp, next) {
  var email = req.body.inputEmail;
  var password = req.body.inputPassword;
  var fname = req.body.inputFName;
  var lname = req.body.inputLName;

  console.log(email, lname, fname);

  bcrypt.hash(password, saltRounds, function(err, hash) {
    db.query(
      "INSERT INTO users (email, password, last_name, first_name) VALUES (($1), ($2), ($3), ($4)) RETURNING userid",
      [email, hash, lname, fname]
    ).then(function(results) {
      userid = results[0].userid;
      req.login(userid, function(err) {
        resp.redirect("/todos");
      });
    });
  });
});

passport.serializeUser(function(userid, done) {
  done(null, userid);
});

passport.deserializeUser(function(userid, done) {
  done(null, userid);
});

app.get("/todos", function(req, resp, next) {
  console.log(req.user);
  console.log(req.isAuthenticated());
  resp.render("todolist.html");
});

app.post("/todos", function(req, resp, next) {
  var id = req.body.id;
  var userid = req.body.userid;
  console.log(id, userid);
  db.query(
    "UPDATE task SET done = true WHERE id = ($1) AND userid = ($2)",
    id,
    userid
  );
  resp.render("todolist.html");
});

app.post("/todos/add", function(req, resp, next) {
  var task = req.body.task;
  db.query(
    "INSERT INTO task (userid, id, description, done) VALUES ($1, default, $2, false)",
    [userid, task]
  );
  resp.redirect("/");
});

app.get("/todos/done", function(req, resp) {
  db.query("SELECT * FROM task WHERE userid = ($1)", userid).then(function(
    results
  ) {
    resp.render("done.html", {
      results: results
    });
  });
});

app.post("/todos/done", function(req, resp, next) {
  var id = req.body.id;
  db.query(
    "UPDATE task SET done = false WHERE id = ($1) userid = ($2)",
    id,
    userid
  );
  resp.redirect("/todos/done");
});

app.post("/todos/delete", function(req, resp, next) {
  var id = req.body.id;
  db.query("DELETE FROM task WHERE id = ($1) userid = ($2)", id, userid);
  resp.redirect("/todos/done");
});

app.listen(process.env.PORT || 8000, function() {
  console.log("Listening on port 8000");
});
