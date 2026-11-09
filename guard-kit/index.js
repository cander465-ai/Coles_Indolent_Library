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
    
}