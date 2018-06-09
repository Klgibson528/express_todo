# express_todo

to-do app built using express

## Pages

* GET `/` - homepage

## API Pages (pages that only serve JSON data)

* GET `/api/todos` - list of all todos
  * only returns JSON
  * runs a query that gets all of the todos, then returns it as JSON
* POST `/api/todos` - create a new TODO item
  * user sends new todo data via request body
  * validate the data (make sure it is not garbage)
  * INSERT query into the database and return `{"success": true}`
    * bonus points: return HTTP 201 code
* POST `/api/todos/<id>` - update an existing TODO
  * user marks a TODO as complete or not
  * send data through request.body
  * server makes sure that <id> exists
  * run an UPDATE query to update that todo
  * return the updated TODO as JSON
