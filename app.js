//look at .fetch API for ajax and calling endpoints
const express = require("express");
const body_parser = require("body-parser");
const app = express();
const pgp = require("pg-promise")({});
const db = pgp({
  database: "todo",
  user: "postgres"
});

const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

client.connect();

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
  db.query("SELECT * FROM task").then(function(results) {
    resp.render("todolist.html", {
      results: results
    });
  });
});

app.post("/", function(req, resp, next) {
  var id = req.body.id;
  db.query("UPDATE task SET done = true WHERE id = ($1)", id);
  resp.redirect("/");
});

app.post("/add", function(req, resp, next) {
  var task = req.body.task;
  db.query(
    "INSERT INTO task (id, description, done) VALUES (default, $1, false)",
    task
  );
  resp.redirect("/");
});

app.get("/todos/done", function(req, resp) {
  db.query("SELECT * FROM task").then(function(results) {
    resp.render("done.html", {
      results: results
    });
  });
});

app.post("/todos/done", function(req, resp, next) {
  var id = req.body.id;
  db.query("UPDATE task SET done = false WHERE id = ($1)", id);
  resp.redirect("/todos/done");
});

app.post("/todos/delete", function(req, resp, next) {
  var id = req.body.id;
  db.query("DELETE FROM task WHERE id = ($1)", id);
  resp.redirect("/todos/done");
});

app.listen(process.env.PORT || 8000, function() {
  console.log("Listening on port 8000");
});
