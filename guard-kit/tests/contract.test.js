'use strict'
const kit = require('../index')

test('contract: exports match the README API section', () => {
    expect(Object.keys(kit).sort()).toEqual([
        'AppError', 'AuthError', 'ConflictError',
        'NotFoundError', 'ValidationError', 'validate',
    ].sort())
})

test('contract: ValidationError details have field and message', () => {
    try {
        kit.validate({ name: { type: 'string', required: true } }, {})
    } catch (err) {
        expect(err.details[0]).toEqual({ field: 'name', message: 'name is required' })
        return
    }
    throw new Error('should have thrown')
})