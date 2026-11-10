'use strict'
const { createClient, ApiClientError } = require('../index')

const okResponse = (data) => ({ ok: true, status: 200, json: async () => ({ ok: true, data: data }) })

test('get returns the data from the envelope', async () => {
    const client = createClient({ baseUrl: 'http://x', fetchImpl: async () => okResponse({ name: 'Cole' }) })
    expect(await client.get('/users/1')).toEqual({ name: 'Cole' })
})

test('sends the token from getToken as a Bearer header', async () => {
    let seen
    const fetchImpl = async (url, opts) => { seen = opts.headers.Authorization; return okResponse({}) }
    const client = createClient({ baseUrl: 'http://x', getToken: () => 'abc', fetchImpl })
    await client.get('/me')
    expect(seen).toBe('Bearer abc')
})

test('post sends the body as JSON', async () => {
    let seen
    const fetchImpl = async (url, opts) => { seen = opts.body; return okResponse({}) }
    await createClient({ baseUrl: 'http://x', fetchImpl }).post('/users', { name: 'Cole' })
    expect(seen).toBe('{"name":"Cole"}')
})

test('failure: an error envelope is thrown with its code and status', async () => {
    const fetchImpl = async () => ({
        ok: false,
        status: 404,
        json: async () => ({ ok: false, error: { code: 'NOT_FOUND', message: 'no user' } }),
    })
    const client = createClient({ baseUrl: 'http://x', fetchImpl })
    await expect(client.get('/users/9')).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404, message: 'no user' })
})

test('failure: a network problem throws NETWORK_ERROR', async () => {
    const fetchImpl = async () => { throw new Error('offline') }
    await expect(createClient({ baseUrl: 'http://x', fetchImpl }).get('/'))
        .rejects.toMatchObject({ code: 'NETWORK_ERROR' })
})

test('failure: a slow request throws TIMEOUT', async () => {
    const fetchImpl = (url, opts) => new Promise((resolve, reject) => {
        opts.signal.addEventListener('abort', () => reject(new Error('aborted')))
    })
    const client = createClient({ baseUrl: 'http://x', fetchImpl, timeoutMs: 20 })
    await expect(client.get('/')).rejects.toMatchObject({ code: 'TIMEOUT' })
})

test('failure: a response that is not JSON throws HTTP_ERROR', async () => {
    const fetchImpl = async () => ({ ok: false, status: 502, json: async () => { throw new Error('bad') } })
    await expect(createClient({ baseUrl: 'http://x', fetchImpl }).get('/'))
        .rejects.toMatchObject({ code: 'HTTP_ERROR', status: 502 })
})

test('failure: createClient without baseUrl throws', () => {
    expect(() => createClient({})).toThrow(ApiClientError)
})

test('contract: exports and client methods', () => {
    expect(Object.keys(require('../index')).sort()).toEqual(['ApiClientError', 'createClient'])
    expect(Object.keys(createClient({ baseUrl: 'http://x' })).sort()).toEqual(['del', 'get', 'post', 'put'])
})