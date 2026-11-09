'use strict'
const { signToken, verifyToken } = require('../index')

const SECRET = 'test-secret'
const codeOf = (fn) => { try { fn() } catch (err) { return err.code } }

test('sign then verify round-trips the payload', () => {
    const token = signToken({ userId: 'abc' }, SECRET)
    expect(verifyToken(token, SECRET).userId).toBe('abc')
})

test('failure: expired token gives TOKEN_EXPIRED', () => {
    const token = signToken({ userId: 'abc' }, SECRET, { expiresIn: -10 })
    expect(codeOf(() => verifyToken(token, SECRET))).toBe('TOKEN_EXPIRED')
})

test('failure: wrong secret gives TOKEN_INVALID', () => {
    const token = signToken({ userId: 'abc' }, SECRET)
    expect(codeOf(() => verifyToken(token, 'other'))).toBe('TOKEN_INVALID')
})

test('failure: garbage token gives TOKEN_INVALID', () => {
    expect(codeOf(() => verifyToken('not.a.token', SECRET))).toBe('TOKEN_INVALID')
})

test('failure: alg none token is rejected', () => {
    const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')
    const forged = `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ userId: 'abc' })}.`
    expect(codeOf(() => verifyToken(forged, SECRET))).toBe('TOKEN_INVALID')
})

test('failure: empty secret is rejected on sign', () => {
    expect(codeOf(() => signToken({ a: 1 }, ''))).toBe('INVALID_SECRET')
})