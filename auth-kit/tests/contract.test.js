'use strict'
const kit = require('../index')

test('contract: exports match the README API section', () => {
    expect(Object.keys(kit).sort()).toEqual([
        'AuthKitError', 'comparePassword', 'createMemoryStorage', 'getStorage',
        'hashPassword', 'needsRehash', 'removeStorage', 'setStorage',
        'signToken', 'verifyToken',
    ].sort())
})

test('contract: errors carry a code', async () => {
    await expect(kit.hashPassword('')).rejects.toMatchObject({ code: 'INVALID_PASSWORD' })
})