'use strict'

// Base class. Every error in the toolkit extends this.
class AppError extends Error {
    constructor(message, code = 'APP_ERROR', status = 500) {
        super(message)
        this.name = this.constructor.name
        this.code = code
        this.status = status
    }
}

class ValidationError extends AppError {
    constructor(message = 'Validation failed', details = [], code = 'VALIDATION_ERROR') {
        super(message, code, 400)
        this.details = details // [{ field, message }]
    }
}

class AuthError extends AppError {
    constructor(message = 'Not authorized', code = 'AUTH_ERROR') {
        super(message, code, 401)
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Not found', code = 'NOT_FOUND') {
        super(message, code, 404)
    }
}

class ConflictError extends AppError {
    constructor(message = 'Conflict', code = 'CONFLICT') {
        super(message, code, 409)
    }
}

// schema example: { name: { type: 'string', required: true, min: 2 } }
// Returns the input if it is valid, throws ValidationError if not.
function validate(schema, input) {
    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
        throw new ValidationError('input must be an object')
    }

    const problems = []

    for (const field of Object.keys(schema)) {
        const rule = schema[field]
        const value = input[field]

        if (value === undefined || value === null) {
            if (rule.required) {
                problems.push({ field, message: `${field} is required` })
            }
            continue
        }

        if (typeof value !== rule.type || Number.isNaN(value)) {
            problems.push({ field, message: `${field} must be a ${rule.type}` })
            continue
        }

        const size = rule.type === 'string' ? value.length : value
        if (rule.min !== undefined && size < rule.min) {
            problems.push({ field, message: `${field} must be at least ${rule.min}` })
        }
        if (rule.max !== undefined && size > rule.max) {
            problems.push({ field, message: `${field} must be at most ${rule.max}` })
        }
    }

    if (problems.length > 0) {
        throw new ValidationError('Validation failed', problems)
    }
    return input
}

module.exports = {
    AppError,
    ValidationError,
    AuthError,
    NotFoundError,
    ConflictError,
    validate,
}