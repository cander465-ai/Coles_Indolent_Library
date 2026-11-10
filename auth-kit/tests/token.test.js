'use strict'
const { getStorage, setStorage, removeStorage, createMemoryStorage } = require('../index')

const user = { username: 'Cole', role: 'admin' }

test('setStorage stores a JSON string', () => {
    const storage = createMemoryStorage()
    setStorage(storage, 'user', user)
    expect(storage.getItem('user')).toBe(JSON.stringify(user))
})

test('getStorage reads a stored object back', () => {
    const storage = createMemoryStorage()
    setStorage(storage, 'user', user)
    expect(getStorage(storage, 'user')).toEqual(user)
})

test('failure: missing key returns null', () => {
    const storage = createMemoryStorage()
    expect(getStorage(storage, 'nope')).toBeNull()
})

test('failure: corrupt JSON returns the fallback instead of throwing', () => {
    const storage = createMemoryStorage()
    storage.setItem('broken', 'not valid JSON')
    expect(getStorage(storage, 'broken')).toBeNull()
    expect(getStorage(storage, 'broken', 'default')).toBe('default')
})

test('failure: storage returning undefined is treated as missing', () => {
    const storage = { getItem: () => undefined }
    expect(getStorage(storage, 'x')).toBeNull()
})

test('failure: setStorage rejects values that cannot be stored', () => {
    const storage = createMemoryStorage()
    expect(() => setStorage(storage, 'x', undefined)).toThrow(/cannot be stored/)
})

test('removeStorage deletes a key', () => {
    const storage = createMemoryStorage()
    setStorage(storage, 'user', user)
    removeStorage(storage, 'user')
    expect(getStorage(storage, 'user')).toBeNull()
})