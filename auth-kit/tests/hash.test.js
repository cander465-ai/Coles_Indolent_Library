const {hashPassword,comparePassword} = require('../index')

describe(`Auth Kit`, () =>{
    test('hashPassword should return a hashed password', async ()=> {
        const password = 'Top5PasswordOAT'

        const hashed = await hashPassword(password)

        expect(hashed).not.toBe(password)
        expect(hashed).toMatch(/^\$2/)
   })
})
// Alright looks ike my password hashing works. I looked the whole testing thing up it was super sweet. Had some syntax errors tho
