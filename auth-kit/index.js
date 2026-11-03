'use strict'

const bcrypt = require('bcryptjs')

function hashPassword(password, saltRounds = 10) {
    return bcrypt.hash(password,saltRounds)
}
function comparePassword(hashed,password){
    return bcrypt.compare(password,hashed)
}
function needsRehash(hashed){

}
async function signToken(){
    
}
async function verifyToken() {
    
}
function getStorage(){

}
function setStorage(){

}

module.exports = {setStorage,getStorage,signToken,verifyToken,needsRehash,comparePassword,hashPassword}