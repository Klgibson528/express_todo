//look at .fetch API for ajax and calling endpoints
const express = require("express");
const body_parser = require("body-parser");
const app = express();
const pgp = require("pg-promise")({});
const bcrypt = require("bcrypt");
const expressValidator = require("express-validator");
const saltRounds = 10;
const db = pgp(
  process.env.DATABASE_URL || { database: "todo", user: "postgres" }
);

const nunjucks = require("nunjucks");
nunjucks.configure("views", {
  autoescape: true,
  express: app,
  noCache: true
});

app.use(express.static("public"));
app.use(
  body_parser.urlencoded({
    extended: false
  })
);
app.use(expressValidator());

app.post("/", function(req, resp) {
  var email = req.body.InputEmail1;

  db.query("SELECT userid FROM users WHERE email = ($1)", email).then(function(
    results
  ) {
    userid = results[0].userid;
    console.log(userid);
    db.query("SELECT * FROM task WHERE userid = ($1)", userid).then(function(
      results
    ) {
      resp.render("todolist.html", {
        results: results
      });
    });
  });
});

app.get("/signup", function(req, res, next) {
  res.render("signup.html");
});

app.get("/", function(req, res, next) {
  res.render("signin.html");
});

app.post("/update", function(req, resp, next) {
  var id = req.body.id;
  var userid = req.body.userid
  console.log(id, userid)
  db.query(
    "UPDATE task SET done = true WHERE id = ($1) AND userid = ($2)",
    id,
    userid
  );
  // resp.render("todolist.html");
});

app.post("/add", function(req, resp, next) {
  var task = req.body.task;
  db.query(
    "INSERT INTO task (userid, id, description, done) VALUES ($1, default, $2, false)",
    userid,
    task
  );
  resp.redirect("/");
});

app.post("/new_user", function(req, resp, next) {
  var email = req.body.inputEmail;
  var password = req.body.inputPassword;
  var hash = bcrypt.hashSync(password, saltRounds);
  var fname = req.body.inputFName;
  var lname = req.body.inputLName;

  req
    .checkBody("email", "The email you entered is invalid, please try again.")
    .isEmail();
  req
    .checkBody(
      "email",
      "Email address must be between 4-100 characters long, please try again."
    )
    .len(4, 100);
  req
    .checkBody(
      "inputPassword",
      "Password must be between 8-100 characters long."
    )
    .len(8, 100);
  req
    .checkBody(
      "inputPassword",
      "Password must include one lowercase character, one uppercase character, a number, and a special character."
    )
    .matches(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/,
      "i"
    );
  req
    .checkBody(
      "inputPassword2",
      "Password must be between 8-100 characters long."
    )
    .len(8, 100);
  req
    .checkBody("inputPassword2", "Passwords do not match, please try again.")
    .equals(req.body.inputPassword);

  console.log(email, hash, lname, fname);
  db.query(
    "INSERT INTO users (userid, email, password, last_name, first_name) VALUES (default, $1, $2, $3, $4)",
    [email, hash, lname, fname]
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
