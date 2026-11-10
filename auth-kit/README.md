# auth-kit

## What it does
auth-kit hashes passwords, signs and checks login tokens (JWT), and saves data to any storage object like localStorage. It does not read environment variables or import anything from your app. You pass in the secrets and the storage yourself.

## Install
Copy this folder into your project. It needs the guard-kit folder next to it (../guard-kit). Then run:

npm install bcryptjs jsonwebtoken

## Usage
Save this as example.js inside the auth-kit folder and run: node example.js

```javascript
const {
  hashPassword, comparePassword, needsRehash,
  signToken, verifyToken,
  setStorage, getStorage, createMemoryStorage,
} = require('./index')

async function main() {
  const hash = await hashPassword('MyPassword123', 10)
  console.log(await comparePassword('MyPassword123', hash)) // true
  console.log(await comparePassword('wrong', hash))         // false
  console.log(needsRehash(hash, 12))                        // true

  const token = signToken({ userId: 'abc' }, 'my-secret')
  console.log(verifyToken(token, 'my-secret').userId)       // abc

  try {
    verifyToken(token, 'wrong-secret')
  } catch (err) {
    console.log(err.code)                                   // TOKEN_INVALID
  }

  const storage = createMemoryStorage()
  setStorage(storage, 'user', { name: 'Cole' })
  console.log(getStorage(storage, 'user'))                  // { name: 'Cole' }
}

main()
```

## API
Passwords:
- hashPassword(password, saltRounds = 12) returns a promise with the hash. Throws INVALID_PASSWORD (empty or not a string), PASSWORD_TOO_LONG (over 72 bytes), or INVALID_ROUNDS (not a whole number from 4 to 31).
- comparePassword(password, hash) returns a promise with true or false. Never throws. Bad input or a bad hash gives false.
- needsRehash(hash, desiredRounds = 12) returns true if the hash used fewer rounds than desired, or if the hash can't be read. Never throws.

Tokens:
- signToken(payload, secret, { expiresIn = '1h' }) returns the token. Throws INVALID_SECRET if the secret is empty or not a string.
- verifyToken(token, secret) returns the payload. Throws TOKEN_EXPIRED or TOKEN_INVALID.

Storage (a storage object is anything with getItem, setItem, and removeItem):
- setStorage(storage, key, value) saves the value as JSON. Throws INVALID_VALUE if it can't be saved.
- getStorage(storage, key, fallback = null) returns the saved value, or the fallback if the key is missing or the saved text is broken.
- removeStorage(storage, key) deletes the key.
- createMemoryStorage() returns a simple storage object that lives in memory. Good for tests.

Errors:
- All errors come from guard-kit. Password and secret problems are ValidationError. Token problems are AuthError. Every error has a code.

## Decisions
- The secret is passed in on every call. This keeps the module from reading environment variables. The downside is a little more typing.
- Passwords over 72 bytes are rejected. bcrypt ignores everything after 72 bytes, so two different long passwords could match. I count bytes instead of characters because emoji and accented letters take more than one byte.
- comparePassword returns false instead of crashing. A user with no password, like an OAuth user, should just fail to log in.
- needsRehash returns true for a hash it can't read, because a broken hash should be replaced.
- Tokens always use the HS256 algorithm. This blocks fake tokens that say they need no signature.
- The module throws guard-kit errors, so callers never need to import bcryptjs or jsonwebtoken to handle them.
- Storage is passed in, so the module never touches window or localStorage directly. It works in Node and in tests.
- auth-kit depends on guard-kit on purpose. The error classes are shared by the whole toolkit, so they live in one place instead of being copied.

## Changes
- v1.0: First version.
- v1.1 (Module 4): AuthKitError removed. Now throws guard-kit ValidationError and AuthError. The error codes did not change.