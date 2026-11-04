
'use strict'
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

function hashPassword(password, saltRounds = 12) {
    return bcrypt.hash(password,saltRounds)
}
function comparePassword(hashed,password){
    return bcrypt.compare(hashed,password)
}
function needsRehash(existingHash, desiredRounds = 12) {
    return bcrypt.getRounds(existingHash) < desiredRounds
}
function signToken(payload,secret,options = {}){
   return jwt.sign(payload,secret,options)
}
function verifyToken(token,secret,options={}) {
    return jwt.verify(token,secret,options)
}
function getStorage(storage,key){
    const storageVal = storage.getItem(key)
    return storageVal == null ? null : JSON.parse(storageVal)
}
function setStorage(storage, key, value) {
    return storage.setItem(key, JSON.stringify(value))
}
module.exports = {setStorage,getStorage,signToken,verifyToken,needsRehash,comparePassword,hashPassword}