# guard-kit

## What it does
guard-kit is a shared set of error classes (each with a code and an HTTP status) and a small validate function for checking objects. It has no dependencies and imports nothing from your app.

## Install
Copy this folder into your project. There is nothing to install.

## Usage
Save this as example.js inside the guard-kit folder and run: node example.js

```javascript
const { validate, ValidationError, NotFoundError } = require('./index')

const schema = {
  name: { type: 'string', required: true, min: 2 },
  age: { type: 'number', min: 0 },
}

console.log(validate(schema, { name: 'Cole', age: 25 })) // { name: 'Cole', age: 25 }

try {
  validate(schema, { age: -1 })
} catch (err) {
  console.log(err instanceof ValidationError) // true
  console.log(err.status)                     // 400
  console.log(err.details)                    // [ { field: 'name', message: 'name is required' }, { field: 'age', message: 'age must be at least 0' } ]
}

const notFound = new NotFoundError('User not found')
console.log(notFound.code, notFound.status)   // NOT_FOUND 404
```

## API
- AppError(message, code = 'APP_ERROR', status = 500) is the base class. It extends Error.
- ValidationError(message = 'Validation failed', details = [], code = 'VALIDATION_ERROR') has status 400. details is a list of { field, message }.
- AuthError(message = 'Not authorized', code = 'AUTH_ERROR') has status 401.
- NotFoundError(message = 'Not found', code = 'NOT_FOUND') has status 404.
- ConflictError(message = 'Conflict', code = 'CONFLICT') has status 409.
- validate(schema, input) returns input if it is valid. Throws ValidationError if not.
- Schema fields support type ('string', 'number', 'boolean'), required, min, and max. min and max check length for strings and value for numbers.
- validate throws ValidationError if input is not a plain object.

## Decisions
- One base class. Every error extends AppError, so other code can catch all toolkit errors with one instanceof check.
- Subclasses accept a custom code. This lets auth-kit keep specific codes like TOKEN_EXPIRED while still being an AuthError with status 401.
- validate collects every problem and reports them all in details, so a form can show all errors at once.
- No dependencies. The error classes are the shared contract for the whole toolkit, so guard-kit stays dependency-free and the other modules can import it safely.
- The schema is small on purpose. Anything more complex belongs in a validation library.

## Changes
- v1.0: First version.
- v1.1 (Module 4): ValidationError now accepts a custom code, so other kits can keep their specific error codes. auth-kit, db-kit, and api-kit now depend on guard-kit.