'use strict'
const { hashPassword, comparePassword, needsRehash } = require('../index')

const PASSWORD = 'Top5PasswordOAT'

test('hashPassword returns a hash, not the plain password', async () => {
    const hashed = await hashPassword(PASSWORD, 4)
    expect(hashed).not.toBe(PASSWORD)
    expect(hashed).toMatch(/^\$2/)
})

test('failure: hashPassword rejects a password over 72 bytes', async () => {
    const tooLong = 'a'.repeat(73)
    await expect(hashPassword(tooLong, 4)).rejects.toMatchObject({ code: 'PASSWORD_TOO_LONG' })
})

test('failure: hashPassword counts bytes, not characters', async () => {
    const emoji = '😀'.repeat(25) // 25 characters but 100 bytes
    await expect(hashPassword(emoji, 4)).rejects.toMatchObject({ code: 'PASSWORD_TOO_LONG' })
})

test('failure: hashPassword rejects an empty password', async () => {
    await expect(hashPassword('', 4)).rejects.toMatchObject({ code: 'INVALID_PASSWORD' })
})

test('comparePassword returns true for the right password', async () => {
    const hashed = await hashPassword(PASSWORD, 4)
    expect(await comparePassword(PASSWORD, hashed)).toBe(true)
})

test('failure: comparePassword returns false for the wrong password', async () => {
    const hashed = await hashPassword(PASSWORD, 4)
    expect(await comparePassword('wrong', hashed)).toBe(false)
})

test('failure: comparePassword returns false for a bad hash', async () => {
    expect(await comparePassword(PASSWORD, 'not-a-hash')).toBe(false)
    expect(await comparePassword(PASSWORD, null)).toBe(false)
})

test('needsRehash is true when the hash has fewer rounds than wanted', async () => {
    const hashed = await hashPassword(PASSWORD, 4)
    expect(needsRehash(hashed, 5)).toBe(true)
})

test('needsRehash is false when the hash already has enough rounds', async () => {
    const hashed = await hashPassword(PASSWORD, 5)
    expect(needsRehash(hashed, 5)).toBe(false)
})