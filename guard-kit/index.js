'use strict'

class AppError extends Error{
    constructor(message, code = 'APP_ERROR', status = 500){
        super(message)
        this.name = this.constructor.name
        this.code = code
        this.status = status
    }
}
class ValidationError extends AppError{
    constructor(message='Validation failed', details = []){
        super(message,'VALIDATION_ERROR',400)
        this.details = details // [{field,message}]
    }
}
class AuthError extends AppError{
    constructor(message='Unauthorized',code = 'AUTH_ERROR'){
        super(message,code,401)
    }
}
class NotFoundError extends AppError{
    constructor(message = 'Not found',code = 'NOT_FOUND'){
        super(message,code,404)
    }
}
class ConflictError extends AppError{
    constructor(message='Conflict', code = 'CONFLICT'){
        super(message,code,409)
    }
}
// Schem1 example :{name:{type:String, required:true,min;2 }}
function validate(schema,input){
    if(typeof input !== 'object' || input === null || Array.isArray(input)){
        throw new ValidationError('input must be an object.')
    }
    const problems = []

    for(const field of Object.keys(schema)){
        const rule = schema[field]
        const value = input[field]

        if(value === undefined || value === null){
            if(rule.required){
                problems.push({field, message: `${field} must be a ${rule.type}`})
                continue
            }
        }
        const size = rule.type === 'string'? value.length : value 
        if(rule.min !== undefined && size < rule.min){
            problems.push({field,message: `${field} must be at least ${rule.min}`})
        }
        if(rule.max !== undefined && size > rule.max){
            problems.push({field,message: `${field} must be at most ${rule.max}`})
        }
    }
    if(problems.length > 0){
        throw new ValidationError('Validation Failed', problems)
    }
    return input 
}

module.exports = {
    AppError,
    ValidationError,
    ConflictError,
    AuthError,
    NotFoundError,
    validate
}