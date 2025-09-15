# Controllers

This directory contains controller functions that handle incoming requests and return responses.

Controllers should:
- Be named according to the resource they manage (e.g., `userController.js`, `sensorController.js`)
- Contain functions for each CRUD operation
- Not directly interact with the database (that's the model's responsibility)
- Not contain business logic (that should be in services)