'use strict'
const mongoose = require('mongoose')
const { ValidationError, NotFoundError, AppError } = require('../guard-kit')

const MODEL_METHODS = ['create', 'find', 'findById', 'findByIdAndUpdate', 'findByIdAndDelete']

async function connect(uri, options = {}) {
    if (typeof uri !== 'string' || uri.length === 0) {
        throw new ValidationError('uri must be a non-empty string', [], 'INVALID_URI')
    }
    try {
        return await mongoose.connect(uri, options)
    } catch (err) {
        throw new AppError('could not connect to the database', 'DB_CONNECT_FAILED', 500)
    }
}

// Makes a schema that always has createdAt and updatedAt
function withDefaults(definition) {
    if (typeof definition !== 'object' || definition === null) {
        throw new ValidationError('definition must be an object', [], 'INVALID_DEFINITION')
    }
    return new mongoose.Schema(definition, { timestamps: true })
}

// Works with any model. The model is passed in by the caller.
function createRepository(Model) {
    if (!Model || MODEL_METHODS.some((name) => typeof Model[name] !== 'function')) {
        throw new ValidationError('Model needs: ' + MODEL_METHODS.join(', '), [], 'INVALID_MODEL')
    }

    function found(doc) {
        if (!doc) throw new NotFoundError('not found')
        return doc
    }

    return {
        create: (data) => Model.create(data),
        find: (filter = {}) => Model.find(filter),
        findById: async (id) => found(await Model.findById(id)),
        update: async (id, data) =>
            found(await Model.findByIdAndUpdate(id, data, { new: true, runValidators: true })),
        remove: async (id) => found(await Model.findByIdAndDelete(id)),
    }
}

module.exports = { connect, withDefaults, createRepository }