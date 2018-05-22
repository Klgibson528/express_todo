const express = require("express");
const body_parser = require("body-parser");
const app = express();
const pgp = require("pg-promise")({});
const db = pgp({ database: "todo", user: "postgres" });
const nunjucks = require("nunjucks");
nunjucks.configure("views", {
  autoescape: true,
  express: app,
  noCache: true
});

app.use(express.static("public"));
app.use(body_parser.urlencoded({ extended: false }));

app.get("/todos", function(req, resp) {
  resp.render("todos.html");
});

app.post("/todos/add", function(req, resp) {
  console.log(req.body);
  var task = req.body;
  resp.render("index.html");
});

app.get("/todos/done/:id", function(request, response) {
  response.send("Projects");
});
// //url parameters
// app.get("/post/:id", function(request, response, next) {
//   var id = request.params.id;

//   db
//     .query("SELECT * FROM restaurant WHERE id=$1", [id])
//     //gives you one results .one("SELECT * FROM restaurant WHERE id=$1", [id])
//     .then(function(results) {
//       response.send(results);
//     })
//     //not giving error message
//     .catch(next);
// });

// app.get("/form", function(req, resp) {
//   resp.render("form.html");
// });

// // should include some form validation to make sure things are filled out
// app.post("/submit", function(req, resp) {
//   console.log(req.body);
//   resp.render("index.html");
// });

// app.get("/hello", function(request, response) {
//   var name = request.query.name || "World";
//   // context is variables you want in your template
//   var context = {
//     title: "Hello",
//     name: name,
//     friends: [{ name: "Joan" }]
//   };
//   response.render("index.html", context);
// });

app.listen(8008, function() {
  console.log("Listening on port 8008");
});
