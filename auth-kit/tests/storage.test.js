'use strict'
const {getStorage,setStorage} = require('../index')

const mockStorage = {
    data:{},

    getItem(key){
        return this.data[key] ?? null
    },

    setItem(key,value){
        this.data[key] = value
    }
}
test('setStorage should store a value' , () =>{
    const user = {
        username: 'Cole',
        role: 'admin'
    }
    setStorage(mockStorage, 'user',user)

    expect(mockStorage.getItem('user')).toBe(JSON.stringify(user))
})
test('getStorage should pull from the mock storage' , () =>{
    const user = {
        username: 'Cole',
        role: 'admin'
    }
    mockStorage.setItem('user',JSON.stringify(user))

    const result = getStorage(mockStorage , 'user')

    expect(result).toEqual(user)
})
// Yay both tests work -----------------------------------------------------
test('Result should be null when there is no key value.' , () =>{
    const user = {
        username: 'Cole',
        role: 'admin'
    }
    mockStorage.setItem('user',JSON.stringify(user))

    const result = getStorage(mockStorage, '')

    expect(result).toBeNull()
})
// Trying to pull with a key that isnt stored - It worked 
test('Result should be undefined when they enter invalid JSON' , () =>{
    const user = {
        username: 'Cole',
        role: 'admin'
    }
    mockStorage.setItem('broken','not valid JSON')

    const result = getStorage(mockStorage, '')

    expect(() => getStorage(mockStorage, 'broken')).toThrow(SyntaxError)
})