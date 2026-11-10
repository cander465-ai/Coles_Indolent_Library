'use strict'
const express = require('express')
const { NotFoundError, ValidationError, validate } = require('../guard-kit')

const REPO_METHODS = ['create', 'find', 'findById', 'update', 'remove']

// The one response shape
function success(data) {
    return { ok: true, data: data }
}

function failure(code, message, details) {
    const body = { ok: false, error: { code: code, message: message } }
    if (details) body.error.details = details
    return body
}

// Sends errors from async functions to next() so they don't crash the server
function asyncHandler(fn) {
    return (req, res, next) => Promise.resolve().then(() => fn(req, res, next)).catch(next)
}

// Put this last: app.use(errorHandler)
function errorHandler(err, req, res, _next) {
    const known = err && typeof err.status === 'number' && typeof err.code === 'string'
    const status = known ? err.status : 500
    const code = known ? err.code : 'INTERNAL_ERROR'
    const message = known ? err.message : 'Something went wrong'
    res.status(status).json(failure(code, message, known ? err.details : undefined))
}

// repository only needs these 5 methods. options.schema is an optional guard-kit schema.
function createCrudRouter(repository, options = {}) {
    if (!repository || REPO_METHODS.some((name) => typeof repository[name] !== 'function')) {
        throw new ValidationError('repository needs: ' + REPO_METHODS.join(', '), [], 'INVALID_REPOSITORY')
    }

    const router = express.Router()
    const check = (body) => (options.schema ? validate(options.schema, body) : body)
    const found = (doc) => {
        if (!doc) throw new NotFoundError('not found')
        return doc
    }

    router.get('/', asyncHandler(async (req, res) => {
        res.json(success(await repository.find({})))
    }))
    router.get('/:id', asyncHandler(async (req, res) => {
        res.json(success(found(await repository.findById(req.params.id))))
    }))
    router.post('/', asyncHandler(async (req, res) => {
        const doc = await repository.create(check(req.body))
        res.status(201).json(success(doc))
    }))
    router.put('/:id', asyncHandler(async (req, res) => {
        res.json(success(found(await repository.update(req.params.id, check(req.body)))))
    }))
    router.delete('/:id', asyncHandler(async (req, res) => {
        found(await repository.remove(req.params.id))
        res.json(success({ id: req.params.id }))
    }))

    return router
}

module.exports = { success, failure, asyncHandler, errorHandler, createCrudRouter }