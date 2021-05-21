const crypto = require('crypto')
const bcrypt = require('bcrypt')
const sprintf = require('sprintf-js').sprintf
const uniqid = require('uniqid')
function crypt(s1,s2){
    return bcrypt.hash(s1,s2)
}
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
const saltPrefix = "2a";
const defaultCost = 14;
const bcryptSaltLength = 22;
function base64_encode(str){
    return Buffer.from(str,"base64").toString();
}
class BCrypt extends Algorithm{
    generateRandomSalt(){
        const seed  = uniqid(mt_rand())
        var salt = base64_encode(seed)
        salt.replace("+", ".")
        return salt.substr(0, bcryptSaltLength)
    }
    hash(passwd, cost = null){
        if(cost = null){
            cost = defaultCost;
        }
        const salt = this.generateRandomSalt()
        var hashString = this.generateHashString(parseInt(cost), salt)
        return crypt(passwd, hashString)

    }
    hash(passwd){
        hash(passwd,defaultCost)
    }
    isValid(passwd, hash){
        return crypt(passwd, hash) ==hash
    }
    generateHashString(cost,salt){
        return sprintf('$%s$%02d$%s$', saltPrefix, cost, salt);

    }
}

class AuthMe extends Algorithm{

    constructor(){
        super()
        
        this.CHARS = AuthMe.initCharRange();
    }
    
    hash(passwd){
        var salt = this.generateSalt()
        return `$SHA$${salt}$${sha256(sha256(passwd) + salt)}$AUTHME`
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
const sha256chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
const sha256saltLength = 24
class SHA256 extends Algorithm{
    hash(passwd){
        const salt = generateSalt()
        return `$SHA256$${sha256(sha256(passwd) + salt)}@${salt}`
    }
    generateSalt(){
        const maxCharIndex = sha256chars.length-1
        var salt = "";
        for(var i=0; i<sha256saltLength; i++){
            salt += sha256chars[mt_rand(0,maxCharIndex)]
        }
        return salt
    }
    isValid(passwd, hash){
        var parts = hash.split("$")
        var saltParts = hash.split("@")
        return parts.length == 3 && saltParts.length == 2 && parts[2] == sha256(sha256(passwd)+saltParts[1])
    }
}
module.exports = {
    Algorithm,
    AuthMe,
    BCrypt,
    SHA256
}