# auth-kit

## What it does
auth-kit hashes passwords, signs and checks login tokens (JWT), and saves data to any storage object like localStorage. It does not read environment variables or import anything from your app. You pass in the secrets and the storage yourself.

## Install
Copy this folder into your project, then run:

npm install bcryptjs jsonwebtoken

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
- AuthKitError is the error this module throws. It has a code property.

## Decisions
- The secret is passed in on every call. This keeps the module from reading environment variables. The downside is a little more typing.
- Passwords over 72 bytes are rejected. bcrypt ignores everything after 72 bytes, so two different long passwords could match. I count bytes instead of characters because emoji and accented letters take more than one byte.
- comparePassword returns false instead of crashing. A user with no password, like an OAuth user, should just fail to log in.
- needsRehash returns true for a hash it can't read, because a broken hash should be replaced.
- Tokens always use the HS256 algorithm. This blocks fake tokens that say they need no signature.
- The module throws its own errors, so callers never need to import bcryptjs or jsonwebtoken to handle them.
- Storage is passed in, so the module never touches window or localStorage directly. It works in Node and in tests.

## Changes
- v1.0: First version.
- Module 4 (planned): AuthKitError will be replaced by the error classes from guard-kit, so the whole toolkit shares one error format. This is a dependency on another module, chosen on purpose.