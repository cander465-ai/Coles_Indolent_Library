# db-kit

## What it does
db-kit connects to MongoDB, makes schemas with timestamps, and gives you a repository (create, find, findById, update, remove) that works with any model. It does not know about your models. You pass them in.

## Install
Copy this folder into your project. It needs the guard-kit folder next to it (../guard-kit). Then run:

npm install mongoose

## Usage
Save this as example.js inside the db-kit folder and run: node example.js
This uses a fake model so no database is needed. In a real app, pass your mongoose model instead.

```javascript
const { withDefaults, createRepository } = require('./index')

const schema = withDefaults({ name: String })
console.log(Boolean(schema.path('createdAt'))) // true

const items = {}
const FakeModel = {
  create: async (d) => { items[1] = { id: 1, ...d }; return items[1] },
  find: async () => Object.values(items),
  findById: async (id) => items[id] || null,
  findByIdAndUpdate: async (id, d) => (items[id] ? Object.assign(items[id], d) : null),
  findByIdAndDelete: async (id) => { const x = items[id] || null; delete items[id]; return x },
}

async function main() {
  const repo = createRepository(FakeModel)
  await repo.create({ name: 'Cole' })
  console.log(await repo.findById(1)) // { id: 1, name: 'Cole' }
  try {
    await repo.findById(99)
  } catch (err) {
    console.log(err.code) // NOT_FOUND
  }
}

main()
```

## API
- connect(uri, options = {}) connects to MongoDB. Throws INVALID_URI if the uri is empty or not a string. Throws DB_CONNECT_FAILED if the connection fails.
- withDefaults(definition) returns a mongoose Schema with createdAt and updatedAt. Throws INVALID_DEFINITION if the definition is not an object.
- createRepository(Model) returns an object with create(data), find(filter = {}), findById(id), update(id, data), and remove(id). Throws INVALID_MODEL if Model is missing methods.
- findById, update, and remove throw NOT_FOUND when nothing matches.
- All errors come from guard-kit.

## Decisions
- The model is passed in. The repository only calls five standard methods on it, so it works with any model.
- Missing documents throw NOT_FOUND instead of returning null, so callers never forget to check.
- The URI is an argument. The module never reads environment variables.
- db-kit depends on guard-kit on purpose, so the whole toolkit shares one error format.
- No pagination yet, to keep the module small.

## Changes
- v1.0: First version.
- Module 4: uses guard-kit errors (ValidationError, NotFoundError, AppError).