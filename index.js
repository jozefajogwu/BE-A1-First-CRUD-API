// Import the Express framework
const express = require('express');

// Import Swagger UI so we can display interactive API documentation
const swaggerUi = require('swagger-ui-express');


// Import the OpenAPI description
const openApiDocument = require('./openapi.json');

// Create an Express application
const app = express();

// allow express to parse JSON in request bodies
app.use(express.json());


// Serve Swagger UI at /docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

// The port our server will run on
const port = 3000;


// ----------------------------------------------------
// In-memory data
// This is our temporary "database".
// The tasks will disappear when the server restarts.
// ----------------------------------------------------
const tasks = [
  { id: 1, title: 'Buy groceries', done: false },
  { id: 2, title: 'Walk the dog', done: true },
  { id: 3, title: 'Read a book', done: false }
];


// ----------------------------------------------------
// Root endpoint
// Gives basic information about the API.
// ----------------------------------------------------
app.get('/', (req, res) => {
  res.json({
    name: 'Task API',
    version: '1.0',
    endpoints: ['/tasks']
  });
});


// ----------------------------------------------------
// Health endpoint
// Used to check that the server is running correctly.
// ----------------------------------------------------
app.get('/health', (req, res) => {
  res.json({
    status: 'ok'
  });
});


// ----------------------------------------------------
// GET /tasks
// Returns all tasks in the list.
// ----------------------------------------------------
app.get('/tasks', (req, res) => {
  res.json(tasks);
});


// ----------------------------------------------------
// GET /tasks/:id
// Returns one task using the ID from the URL.
// Example: /tasks/1
// ----------------------------------------------------
app.get('/tasks/:id', (req, res) => {

  // URL parameters arrive as text, so convert the ID to a number
  const id = Number(req.params.id);

  // Search the tasks array for a task with the matching ID
  const task = tasks.find((task) => task.id === id);

  // If no matching task exists, return a 404 error
  if (!task) {
    return res.status(404).json({
      error: `Task ${id} not found`
    });
  }

  // Return the matching task
  res.json(task);
});

// ----------------------------------------------------
// POST /tasks
// Creates a new task from the JSON request body.
// ----------------------------------------------------
app.post('/tasks', (req, res) => {

  // Get the title sent by the client
  const { title } = req.body;

  // Check that a title was provided and is not empty
  if (!title || title.trim() === '') {
    return res.status(400).json({
      error: 'Title is required'
    });
  }

  // Find the next available task ID
  const nextId = Math.max(...tasks.map((task) => task.id)) + 1;

  // Create the new task
  const newTask = {
    id: nextId,
    title: title.trim(),
    done: false
  };

  // Add the new task to the in-memory list
  tasks.push(newTask);

  // Return the new task with status 201 Created
  res.status(201).json(newTask);
});
// ----------------------------------------------------
// Start the server
// ----------------------------------------------------

// ----------------------------------------------------
// PUT /tasks/:id
// Updates an existing task.
// ----------------------------------------------------
app.put('/tasks/:id', (req, res) => {

  // Convert the ID from the URL into a number
  const id = Number(req.params.id);

  // Find the task with the matching ID
  const task = tasks.find((task) => task.id === id);

  // Return 404 if the task does not exist
  if (!task) {
    return res.status(404).json({
      error: `Task ${id} not found`
    });
  }

  // Get the possible updates from the request body
  const { title, done } = req.body;

  // Reject an empty request body
  if (title === undefined && done === undefined) {
    return res.status(400).json({
      error: 'Provide a title or done value'
    });
  }

  // If title was provided, validate and update it
  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        error: 'Title must be a non-empty string'
      });
    }

    task.title = title.trim();
  }

  // If done was provided, validate and update it
  if (done !== undefined) {
    if (typeof done !== 'boolean') {
      return res.status(400).json({
        error: 'Done must be true or false'
      });
    }

    task.done = done;
  }

  // Return the updated task
  res.json(task);
});

// ----------------------------------------------------
// DELETE /tasks/:id
// Removes an existing task.
// ----------------------------------------------------
app.delete('/tasks/:id', (req, res) => {

  // Convert the ID from the URL into a number
  const id = Number(req.params.id);

  // Find the position of the task in the array
  const taskIndex = tasks.findIndex((task) => task.id === id);

  // If the task does not exist, return 404
  if (taskIndex === -1) {
    return res.status(404).json({
      error: `Task ${id} not found`
    });
  }

  // Remove exactly one task from the array
  tasks.splice(taskIndex, 1);

  // 204 means success, with no response body
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});