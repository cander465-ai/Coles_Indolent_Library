
'use strict'
/**
 * stage : 2 register logins and report who you are in requests.
 *
 * Why we use tokens instead of sessions:
 * a JSON web token is 3 base64 chunks (header, payload, signature). The signature is made
 * with our secret, so the server can check the token wasn't changed, without storing anything.
 */
const jwt = require('jsonwebtoken')
const bcrypt = require('bycrptjs')

userSchema.pre('save', async function hashPassword(){
  // Only when the password itself changed. Without this line,
  // saving any other field re-hashes the hash.
  if(!this.isModified('password')) return

  this.password = await bcrypt.hash(this.password, 10)
})

function signToken(user) {
    // 'sub' (subject) is the standard claim for "who is this token about"
    const payload = { sub: String(user._id), role: user.role }
    return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn })
}

// The jwt library throws its own error types. We catch them and throw our own ApiError,
// so a bad token becomes a clean 401 and not an accidental 500.
function verifyToken(token) {
    try {
        return jwt.verify(token, jwtSecret)
    } catch (err) {
        throw ApiError.unauthorized('Invalid or expired token')
    }
}

module.exports = { signToken, verifyToken }

