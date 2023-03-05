import mysql from "mysql";
import { BCrypt, SHA512, SHA256, AuthMe, Algorithm } from "./algorithm.js"


const TABLE_NAME = 'nlogin'
class nLogin {
    def_algo: Algorithm = BCrypt;
    pool: mysql.Pool;
    constructor(options: string | mysql.PoolConfig, hashing_method?: "bcrypt" | "authme" | "sha256" | "sha512") {
        this.pool = mysql.createPool(options);
        switch (hashing_method) {
            case "authme":
                this.def_algo = AuthMe;
                break;
            case "bcrypt":
                this.def_algo = BCrypt;
                break;
            case "sha256":
                this.def_algo = SHA256;
                break;
            case "sha512":
                this.def_algo = SHA512;
                break;
        }
    }

    /**
     * Retrieves the hash associated with the given user from the database.
     */
    getHashedPassword(username: string): Promise<string> {
        return new Promise((resolve, reject) => {
            username = username.trim();
            this.pool.query(`select password from nlogin where name = '${username.toLowerCase()}' limit 1`, (err, result, fields) => {
                if (err) return reject(err);
                resolve(result[0] ? result[0].password : "")
            })
        })
    }
    checkPassword(username: string, password: string): Promise<boolean> {
        return this.getHashedPassword(username).then((hash) => {
            if (hash) {
                let algorithm = this.detectAlgorithm(hash);
                if (algorithm) {
                    return algorithm.isValid(password, hash)
                } else {
                    return false;
                }
            } else {
                return false;
            }
        });


    }

    /**
     * Returns the algorithm used on the hash.
     */
    detectAlgorithm(hashed_pass: String) {
        let algo = (hashed_pass.includes("$") ? hashed_pass.split("$")[1] : '').toUpperCase();
        switch (algo) {
            case '2':
            case '2A':
                return BCrypt;

            case "PBKDF2":
                // will be added
                return null;

            case "ARGON2I":
                // will be added
                return null;

            case "SHA256":
                return SHA256;

            case "SHA":
                return AuthMe;

            default:
                return null;
        }
    }
    hash(passwd: string) {
        return this.def_algo.hash(passwd);
    }
    async getEmail(username: string): Promise<string> {
        return new Promise((resolve, reject) => {
            username = username.trim();
            this.pool.query(`select email from nlogin where name = ? limit 1`, [username.toLowerCase()], (err, result, fields) => {
                if (err) return reject(err);
                resolve(result[0] ? result[0].email : null)
            })
        })
    }
    async setEmail(username: string, email: string): Promise<void> {
        return new Promise((resolve, reject) => {
            username = username.trim()
            this.pool.query("UPDATE nlogin SET email = ? WHERE name = ?", [email, username.toString()], (err, result, fields) => {
                if (err) return reject(err)
                resolve()
            })
        })
    }
    async setIp(username: string, ip: string, callback = null): Promise<void> {
        return new Promise((resolve, reject) => {
            username = username.trim()
            this.pool.query(`UPDATE nlogin SET address = ? WHERE name = ?`, [ip, username.toLowerCase()], (err, result, fields) => {
                if (err) return reject(err);
                resolve();
            })
        })
    }
    async getIp(username: string): Promise<string | null> {

        return new Promise((resolve, reject) => {
            username = username.trim();
            this.pool.query(`select address from nlogin where name = ? limit 1`, [username.toLowerCase()], (err, result, fields) => {
                if (err) return reject(err);
                resolve(result[0] ? result[0].ip : null)
            })
        })
    }
    async isUserRegistered(username: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            username = username.trim();
            this.pool.query(`SELECT 1 FROM ${TABLE_NAME} WHERE name = '${username.toLowerCase()}' LIMIT 1`, (err, result, fields) => {
                if (err) return reject(err);
                resolve(result.length > 0)
            });
        })
    }
    async isIpRegistered(address: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.pool.query('SELECT 1 FROM ? WHERE address = ? LIMIT 1', [TABLE_NAME, address], (err, result, fields) => {
                if (err) return reject(err);
                resolve(result.length > 0)
            });
        })
    }
    /**
     * Changes password for player.
     */
    async changePassword(passwd: string, username: string): Promise<void> {
        return new Promise((resolve, reject) => {
            username = username.trim()
            let hash = this.hash(passwd)
            this.pool.query(`UPDATE nlogin SET password = ? WHERE name = ?`, [hash, username.toLowerCase()], (err, result, fields) => {
                if (err) return reject(err);

                resolve()
            })

        })
    }
    async getInfo(username: string): Promise<object> {
        return new Promise((resolve, reject) => {
            username = username.trim();
            this.pool.query(`select * from nlogin where name = ? limit 1`, [username.toLowerCase()], (err, result, fields) => {
                if (err) return reject(err);
                resolve(result[0]);
            })
        })
    }
    async register(username: string, password: string, email: string = "", ip: string): Promise<void> {
        return new Promise((resolve, reject) => {
            username = username.trim();
            let usernameLowerCase = username.toLowerCase();
            let hash = this.hash(password);
            this.pool.query(`insert into ? (name, real_name, address, password, email) values (?, ?, ?, ?, ?)`, [TABLE_NAME, usernameLowerCase, username, ip, hash, email], (err, result, fields) => {
                if (err) return reject(err);
                resolve()
            })
        })
    }
}
export {
    nLogin,
    BCrypt,
    SHA256,
    AuthMe
}