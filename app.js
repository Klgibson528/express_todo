//look at .fetch API for ajax and calling endpoints
const express = require("express");
const body_parser = require("body-parser");
const app = express();
const pgp = require("pg-promise")({});
const db = pgp({
  database: "todo",
  user: "postgres"
});
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
    let items = [];
    for (var i = 0; i < results.length; i++) {
      items.push(results[i]);
    }

    resp.render("todolist.html", {
      items: items
    });
  });
});

app.post("/add", function(req, resp, next) {
  var task = req.body.task;
  db.query(
    "INSERT INTO task (id, description, done) VALUES (default, $1, false)",
    task
  );
});

app.post("/", function(req, resp, next) {
  var id = req.body.id;
  console.log(id, "This is the id");
  // db.query("UPDATE task SET done = true WHERE id = ($1)", id);
  // resp.redirect("/");
});

app.get("/todos/done", function(req, resp) {
  let done = req.params.done;
  let items = [];

  for (var i = 0; i < results.length; i++) {
    items.push(results[i].description);
  }
  resp.render("done.html", {
    items: items
  });
});

//where does this go?

app.listen(8000, function() {
  console.log("Listening on port 8000");
});
