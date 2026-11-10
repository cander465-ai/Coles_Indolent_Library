# api-client

## What it does
api-client is a small fetch wrapper. It adds the login token, sets a timeout, and turns api-kit style responses into returned data or thrown errors. It imports nothing from the rest of the toolkit.

## Install
Copy this folder into your project. There is nothing to install. It needs fetch, which is built into browsers and Node 18 or newer.

## Usage
Save this as example.js inside the api-client folder and run: node example.js
This uses a fake fetch so no server is needed. Leave out fetchImpl to use the real fetch.

```javascript
const { createClient } = require('./index')

const fakeFetch = async () => ({
  ok: true,
  status: 200,
  json: async () => ({ ok: true, data: { name: 'Cole' } }),
})

const client = createClient({
  baseUrl: 'http://localhost:3000',
  getToken: () => 'my-token',
  fetchImpl: fakeFetch,
})

client.get('/users/1').then(console.log) // { name: 'Cole' }
```

## API
- createClient({ baseUrl, getToken, fetchImpl, timeoutMs = 10000 }) returns { get, post, put, del }. Throws INVALID_BASE_URL if baseUrl is missing.
- get(path) and del(path) return a promise with the data.
- post(path, body) and put(path, body) send the body as JSON and return a promise with the data.
- getToken is optional. If it returns a token, it is sent as Authorization: Bearer token.
- Failures throw ApiClientError with a code and a status. Codes are whatever the server sent (like NOT_FOUND), HTTP_ERROR (bad response), TIMEOUT, or NETWORK_ERROR. Status 0 means no response came back.

## Decisions
- fetchImpl is passed in so tests never need a network.
- The token comes from a getToken function, so the client never touches localStorage and always sends the newest token.
- The client has its own ApiClientError instead of importing guard-kit. This keeps the folder copyable into a browser project on its own.
- Server errors are thrown, not returned, so callers use try/catch and never have to check an ok flag.

## Changes
- v1.0: First version.