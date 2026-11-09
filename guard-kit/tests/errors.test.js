const {AppError,ValidationError,ConflictError,AuthError,NotFoundError,validate} = require('../index')

test('each error has the right default code and status,',() => {
    expect(new ValidationError()).toMatchObject({code:'VALIDATION_ERROR',status:400})
    expect(new AuthError()).toMatchObject({code:'AUTH_ERROR',status: 401})
    expect(new NotFoundError()).toMatchObject({code:'NOT_FOUND',status:404})
    expect(new ConflictError()).toMatchObject({code:'CONFLICT', status: 409})
})
test('every error is an AppError and an Error',() =>{
    const err = new NotFoundError('no user')
    expect(err instanceof AppError).toBe(true)
    expect(err instanceof Error).toBe(true)
    expect(err.message).toBe('no user')
})
test('a custom code can be passed in',() =>{
    const err = new AuthError('token expired','TOKEN_EXPIRED')
    expect(err.code).toBe('TOKEN_EXPIRED')
    expect(err.status).toBe(401)
})
test('faliure: AppError falls back to 500 when no status is given', ()=> {
    const err = new AppError('boom')
    expect(err.code).toBe('APP_ERROR')
    expect(err.status).toBe(500)
})
