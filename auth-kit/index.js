'use strict'
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

// bcrypt only reads the first 72 BYTES of a password (not characters)
const MAX_PASSWORD_BYTES = 72

// Our own error type, so callers never see bcryptjs/jsonwebtoken errors
class AuthKitError extends Error {
    constructor(code, message) {
        super(message)
        this.name = 'AuthKitError'
        this.code = code
    }
}

// Throws if the password is not usable
function checkPassword(password) {
    if (typeof password !== 'string' || password.length === 0) {
        throw new AuthKitError('INVALID_PASSWORD', 'password must be a non-empty string')
    }
    if (Buffer.byteLength(password) > MAX_PASSWORD_BYTES) {
        throw new AuthKitError('PASSWORD_TOO_LONG', 'password is longer than 72 bytes')
    }
}

async function hashPassword(password, saltRounds = 12) {
    checkPassword(password)
    if (!Number.isInteger(saltRounds) || saltRounds < 4 || saltRounds > 31) {
        throw new AuthKitError('INVALID_ROUNDS', 'saltRounds must be a whole number from 4 to 31')
    }
    return bcrypt.hash(password, saltRounds)
}

async function comparePassword(password, hashed) {
    // Bad input means "no match", never a crash
    if (typeof password !== 'string' || typeof hashed !== 'string') return false
    if (Buffer.byteLength(password) > MAX_PASSWORD_BYTES) return false
    try {
        return await bcrypt.compare(password, hashed)
    } catch (err) {
        return false // malformed hash
    }
}

function needsRehash(existingHash, desiredRounds = 12) {
    try {
        return bcrypt.getRounds(existingHash) < desiredRounds
    } catch (err) {
        return true // unreadable hash, so replace it
    }
}

function signToken(payload, secret, options = {}) {
    if (typeof secret !== 'string' || secret.length === 0) {
        throw new AuthKitError('INVALID_SECRET', 'secret must be a non-empty string')
    }
    const expiresIn = options.expiresIn || '1h'
    return jwt.sign(payload, secret, { algorithm: 'HS256', expiresIn: expiresIn })
}

function verifyToken(token, secret) {
    try {
        return jwt.verify(token, secret, { algorithms: ['HS256'] })
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            throw new AuthKitError('TOKEN_EXPIRED', 'token expired')
        }
        throw new AuthKitError('TOKEN_INVALID', 'token invalid')
    }
}

function getStorage(storage, key, fallback = null) {
    const storageVal = storage.getItem(key)
    // == null catches both null and undefined
    if (storageVal == null) return fallback
    try {
        return JSON.parse(storageVal)
    } catch (err) {
        return fallback // corrupt value
    }
}

function setStorage(storage, key, value) {
    const text = JSON.stringify(value)
    if (text === undefined) {
        throw new AuthKitError('INVALID_VALUE', 'value cannot be stored')
    }
    return storage.setItem(key, text)
}

function removeStorage(storage, key) {
    return storage.removeItem(key)
}

// In-memory storage so you can use/test this without a browser
function createMemoryStorage() {
    const data = new Map()
    return {
        getItem: (key) => (data.has(key) ? data.get(key) : null),
        setItem: (key, value) => { data.set(key, String(value)) },
        removeItem: (key) => { data.delete(key) },
    }
}

module.exports = {
    AuthKitError,
    hashPassword,
    comparePassword,
    needsRehash,
    signToken,
    verifyToken,
    getStorage,
    setStorage,
    removeStorage,
    createMemoryStorage,
}