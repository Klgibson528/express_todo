//look at .fetch API for ajax and calling endpoints
const express = require("express");
const body_parser = require("body-parser");
const app = express();
const pgp = require("pg-promise")({});
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

app.get("/", function(req, resp) {
  db.query("SELECT * FROM task WHERE userid = ($1)", userid).then(function(
    results
  ) {
    resp.render("todolist.html", {
      results: results
    });
  });
});

app.get("/signin", function(req, res, next) {
  res.render("signin.html");
});

app.get("/signup", function(req, res, next) {
  res.render("signup.html");
});

app.post("/", function(req, resp, next) {
  var id = req.body.id;
  db.query(
    "UPDATE task SET done = true WHERE id = ($1) userid = ($2)",
    id,
    userid
  );
  resp.redirect("/");
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
  var fname = req.body.inputFName;
  var lname = req.body.inputLName;
  console.log(email, password, lname, fname);
  db.query(
    "INSERT INTO users (userid, email, password, last_name, first_name) VALUES (default, $1, $2, $3, $4)",
    [email, password, lname, fname]
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

app.listen(process.env.PORT || 9000, function() {
  console.log("Listening on port 9000");
});
