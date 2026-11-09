'use strict'

const {validate, ValidationError} = require('../index')

const schema = {
    name:{type:'string',required:true,min:2},
    age: {type :'number',min:0,max:120},
}
test('validate returns the input when it is valid',() => {
    const input = {name:'Cole',age:25}
    expect(validate(schema,input)).toBe(input)
})
test('optional fields can be left out', () =>{
    expect(() => validate(schema, {name: 'Cole'})).not.toThrow()
})

test('failure: missing required field throws ValidationError', () => {
    expect(() => validate(schema, {})).toThrow(ValidationError)
})

test('failure: wrong type is reported', () => {
    try {
        validate(schema, { name: 'Cole', age: 'twenty' })
    } catch (err) {
        expect(err.details[0].field).toBe('age')
        return
    }
    throw new Error('should have thrown')
})

test('failure: too short and too big values are reported', () => {
    try {
        validate(schema, { name: 'C', age: 500 })
    } catch (err) {
        expect(err.details.length).toBe(2)
        return
    }
    throw new Error('should have thrown')
})

test('failure: input that is not an object is rejected', () => {
    expect(() => validate(schema, null)).toThrow(ValidationError)
    expect(() => validate(schema, 'hello')).toThrow(ValidationError)
})
