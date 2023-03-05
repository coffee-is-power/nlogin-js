import bcrypt from "bcryptjs";
import crypto from "crypto";
/*
Generating random numbers in specific range using crypto.randomBytes from crypto library
Maximum available range is 281474976710655 or 256^6-1
Maximum number for range must be equal or less than Number.MAX_SAFE_INTEGER (usually 9007199254740991)
Usage examples:
cryptoRandomNumber(0, 350);
cryptoRandomNumber(556, 1250425);
cryptoRandomNumber(0, 281474976710655);
cryptoRandomNumber((Number.MAX_SAFE_INTEGER-281474976710655), Number.MAX_SAFE_INTEGER);

Tested and working on 64bit Windows and Unix operation systems.
*/
function cryptoRandomNumber(min: number | string = 0, max: number | string = 2147483647) {
    if (typeof min == "string")
        min = parseInt(min, 10)
    if (typeof max == "string")
        max = parseInt(max, 10)
    let distance = max - min;
    if (min >= max) {
        throw new Error('Warning: cryptoRandomNumber() minimum number should be less than maximum');
    } else if (distance > 281474976710655) {
        throw new Error('Warning: cryptoRandomNumber() range is greater than 256^6-1');
    } else if (max > Number.MAX_SAFE_INTEGER) {
        throw new Error('Warning: cryptoRandomNumber() maximum number should be safe integer limit');
    } else {
        let maxBytes = 6;
        let maxDec = 281474976710656;

        // To avoid huge mathematical operations and increase function performance for small ranges
        if (distance < 256) {
            maxBytes = 1;
            maxDec = 256;
        } else if (distance < 65536) {
            maxBytes = 2;
            maxDec = 65536;
        } else if (distance < 16777216) {
            maxBytes = 3;
            maxDec = 16777216;
        } else if (distance < 4294967296) {
            maxBytes = 4;
            maxDec = 4294967296;
        } else if (distance < 1099511627776) {
            maxBytes = 4;
            maxDec = 1099511627776;
        }

        let randbytes = parseInt(crypto.randomBytes(maxBytes).toString('hex'), 16);
        let result = Math.floor(randbytes / maxDec * (max - min + 1) + min);

        if (result > max) {
            result = max;
        }
        return result;
    }
}

export interface Algorithm {
    hash(passwd: string): string;
    isValid(passwd: string, hash: string): boolean;
}
const SALT_LENGTH = 16;
function hash(method: string, passwd: string) {
    return crypto.createHash(method).update(passwd).digest('hex')
}
function sha256(passwd: string) {
    return hash("sha256", passwd);
}
function crypt(passwd: string, salt: string) {
    return bcrypt.hashSync(passwd, salt);
}
const SALT_PREFIX = "2a";
const DEFAULT_COST = 14;
export const BCrypt = {
    hash(passwd: string, cost: number = DEFAULT_COST): string {
        const salt = crypto.randomBytes(11).toString("hex");
        const hashString = this.generateHashString(cost, salt)
        return crypt(passwd, hashString)
    },
    isValid(passwd: string, hash: string): boolean {
        return crypt(passwd, hash) == hash
    },
    generateHashString(cost: number, salt: String) {
        return "$" + SALT_PREFIX + "$" + String(cost).padStart(2, '0') + "$" + salt + "$";
    }
}
const AUTHME_CHARS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "a", "b", "c", "d", "e", "f"];
export const AuthMe = {
    hash(passwd: string) {
        let salt = this.generateSalt()
        return `$SHA$${salt}$${sha256(sha256(passwd) + salt)}$AUTHME`
    },

    isValid(passwd: string, hash: string) {
        const parts = hash.split("$")
        const count = parts.length

        return (count == 4 || count == 5) && parts[3] == sha256(sha256(passwd) + parts[2])
    },
    generateSalt() {
        const maxCharIndex = 15;
        let salt = "";
        for (let i = 0; i < SALT_LENGTH; i++) {
            salt += AUTHME_CHARS[cryptoRandomNumber(0, maxCharIndex)]
        }
        return salt;
    },
}
const SHA256_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
const SHA256_SALT_LENGTH = 24
export const SHA256 = {
    hash(passwd: string) {
        const salt = this.generateSalt()
        return `$SHA256$${sha256(sha256(passwd) + salt)}$${salt}`
    },
    generateSalt() {
        const maxCharIndex = SHA256_CHARS.length - 1
        let salt = "";
        for (let i = 0; i < SHA256_SALT_LENGTH; i++) {
            salt += SHA256_CHARS[cryptoRandomNumber(0, maxCharIndex)]
        }
        return salt
    },
    isValid(passwd: string, hash: string) {
        let parts = hash.split("$")
        switch (parts.length) {
            case 3:
                let saltParts = hash.split("@");
                let salt = saltParts[1];
                return parts[2] + "@" + salt == sha256(sha256(passwd) + salt)
            case 4:
                return parts[2] == sha256(sha256(passwd) + parts[3])
            default:
                return false
        }
    },
}
function sha512(passwd: string) {
    return hash("sha512", passwd);
}
const sha512chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
const sha512saltLength = 24
export const SHA512 = {
    hash(passwd: string) {
        const salt = this.generateSalt()
        return `$SHA512$${sha512(sha512(passwd) + salt)}$${salt}`
    },
    generateSalt() {
        const maxCharIndex = sha512chars.length - 1
        let salt = "";
        for (let i = 0; i < sha512saltLength; i++) {
            salt += sha512chars[cryptoRandomNumber(0, maxCharIndex)]
        }
        return salt
    },
    isValid(passwd: string, hash: string) {
        let parts = hash.split("$")
        switch (parts.length) {
            case 3:
                let saltParts = hash.split("@");
                let salt = saltParts[1];
                return parts[2] + "@" + salt == sha512(sha512(passwd) + salt)
            case 4:
                return parts[2] == sha512(sha512(passwd) + parts[3])
            default:
                return false
        }
    }
}