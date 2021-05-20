const crypto = require('crypto')
function mt_rand (min, max) { // eslint-disable-line camelcase
    //  discuss at: https://locutus.io/php/mt_rand/
    // original by: Onno Marsman (https://twitter.com/onnomarsman)
    // improved by: Brett Zamir (https://brett-zamir.me)
    //    input by: Kongo
    //   example 1: mt_rand(1, 1)
    //   returns 1: 1
    const argc = arguments.length
    if (argc === 0) {
      min = 0
      max = 2147483647
    } else if (argc === 1) {
      throw new Error('Warning: mt_rand() expects exactly 2 parameters, 1 given')
    } else {
      min = parseInt(min, 10)
      max = parseInt(max, 10)
    }
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
class Algorithm{
    hash(passwd){}
    isValid(passwd, hash){}
}
const SALT_LENGTH = 16;
function hash(method, passwd){
    return crypto.createHash(method).update(passwd).digest('hex')
}
function sha256(passwd){
    return hash("sha256", passwd);
}
class AuthMe extends Algorithm{

    constructor(){
        super()
        this.CHARS = AuthMe.initCharRange();
    }
    
    hash(passwd){
        var salt = this.generateSalt()
        return "$SHA$"+salt+"$"+sha256(sha256(passwd)+salt)+"$AUTHME"
    }

    isValid(passwd, hash){
        const parts = hash.split("$")
        const count = parts.length
        
        return (count == 4 || count == 5) && parts[3] == sha256(sha256(passwd)+parts[2])
    }
    generateSalt(){
        const maxCharIndex= 15;
        var salt = "";
        for(var i=0; i<SALT_LENGTH; i++){
            salt+=this.CHARS[mt_rand(0,maxCharIndex)]
        }
        return salt;
    }

    static initCharRange(){
        return [0,1,2,3,4,5,6,7,8,9,"a","b","c","d","e","f"]
    }
}
module.exports = {
    Algorithm,
    AuthMe
}