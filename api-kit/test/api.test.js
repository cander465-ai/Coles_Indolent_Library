'use strict'
const { success, failure, asyncHandler, errorHandler, createCrudRouter } = require('../index')
const { AppError } = require('../../guard-kit')

function fakeRes() {
    return {
        statusCode: 200,
        body: null,
        status(code) { this.statusCode = code; return this },
        json(body) { this.body = body; return this },
    }
}

function fakeRepo(overrides = {}) {
    return {
        create: async (d) => ({ id: 1, ...d }),
        find: async () => [{ id: 1 }],
        findById: async (id) => ({ id }),
        update: async (id, d) => ({ id, ...d }),
        remove: async (id) => ({ id }),
        ...overrides,
    }
}

// Pulls one route handler out of the router so we can call it without a server
function getHandler(router, method, path) {
    const layer = router.stack.find((l) => l.route && l.route.path === path && l.route.methods[method])
    return layer.route.stack[0].handle
}

test('success wraps data in the envelope', () => {
    expect(success({ a: 1 })).toEqual({ ok: true, data: { a: 1 } })
})

test('GET /:id returns the document in the envelope', async () => {
    const handler = getHandler(createCrudRouter(fakeRepo()), 'get', '/:id')
    const res = fakeRes()
    await handler({ params: { id: '5' } }, res, jest.fn())
    expect(res.body).toEqual({ ok: true, data: { id: '5' } })
})

test('POST / answers 201', async () => {
    const handler = getHandler(createCrudRouter(fakeRepo()), 'post', '/')
    const res = fakeRes()
    await handler({ body: { name: 'Cole' } }, res, jest.fn())
    expect(res.statusCode).toBe(201)
})

test('failure: asyncHandler sends thrown errors to next', async () => {
    const next = jest.fn()
    const boom = new Error('boom')
    await asyncHandler(async () => { throw boom })({}, {}, next)
    expect(next).toHaveBeenCalledWith(boom)
})

test('failure: missing document gives NOT_FOUND', async () => {
    const repo = fakeRepo({ findById: async () => null })
    const handler = getHandler(createCrudRouter(repo), 'get', '/:id')
    const next = jest.fn()
    await handler({ params: { id: '1' } }, fakeRes(), next)
    expect(next.mock.calls[0][0].code).toBe('NOT_FOUND')
})

test('failure: bad body gives VALIDATION_ERROR when a schema is set', async () => {
    const router = createCrudRouter(fakeRepo(), { schema: { name: { type: 'string', required: true } } })
    const next = jest.fn()
    await getHandler(router, 'post', '/')({ body: {} }, fakeRes(), next)
    expect(next.mock.calls[0][0].code).toBe('VALIDATION_ERROR')
})

test('failure: errorHandler turns a known error into the envelope', () => {
    const res = fakeRes()
    errorHandler(new AppError('nope', 'MY_CODE', 418), {}, res, jest.fn())
    expect(res.statusCode).toBe(418)
    expect(res.body).toEqual({ ok: false, error: { code: 'MY_CODE', message: 'nope' } })
})

test('failure: errorHandler hides unknown error messages', () => {
    const res = fakeRes()
    errorHandler(new Error('secret db password'), {}, res, jest.fn())
    expect(res.statusCode).toBe(500)
    expect(res.body.error.code).toBe('INTERNAL_ERROR')
    expect(res.body.error.message).not.toMatch(/secret/)
})

test('failure: createCrudRouter rejects a bad repository', () => {
    expect(() => createCrudRouter({})).toThrow(/repository needs/)
})

test('contract: exports, failure envelope, and routes', () => {
    expect(Object.keys(require('../index')).sort())
        .toEqual(['asyncHandler', 'createCrudRouter', 'errorHandler', 'failure', 'success'])
    expect(failure('X', 'msg')).toEqual({ ok: false, error: { code: 'X', message: 'msg' } })
    const routes = createCrudRouter(fakeRepo()).stack
        .filter((l) => l.route)
        .map((l) => Object.keys(l.route.methods)[0] + ' ' + l.route.path)
    expect(routes.sort()).toEqual(['delete /:id', 'get /', 'get /:id', 'post /', 'put /:id'])
})