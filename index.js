var mysql = require('mysql');
var algorithms = require('./algorithm')
const TABLE_NAME = 'nlogin'
class nLogin {

    constructor(host, username, password,database, callback) {
        this.bcrypt = new algorithms.BCrypt();
        this.sha256 = new algorithms.SHA256();
        this.authme = new algorithms.AuthMe();
        this.def_algo = this.bcrypt;
        this.con = mysql.createConnection({
            host: host,
            password: password,
            user: username, 
            database: database
        })
        this.con.connect((err) => {
            if (err) throw err;
            console.log("Connected");
            callback(err)
        })
    }

    /**
     * Retrieves the hash associated with the given user from the database.
     *
     * @param {string} username the username whose hash should be retrieved
     * @return {string|null} the hash, or null if unavailable (e.g. username doesn't exist)
     */
    getHashedPassword(username, callback) {
        username = username.trim();
        this.con.query(`select password from nlogin where name = '${username.toLowerCase()}' limit 1`, (err, result, fields) => {
            if(err) throw err;
            callback(result[0].password)
        })
    }
    checkPassword(username, password,callback) {
        this.getHashedPassword(username, (hash) => {
            if (hash) {
                var algorithm = this.detectAlgorithm(hash);
                if (algorithm) {
                    callback(algorithm.isValid(password, hash))
                }
            } else callback(false)
    
        });
        
    }

    /**
     * Retorna o algoritmo usado na senha.
     *
     * @param {string} hashed_pass Senha criptografada.
     * @return {any} Retorna o algoritmo usado. Se for desconhecido ou não suportado, retorna null.
     */
    detectAlgorithm(hashed_pass) {
        var algo = (hashed_pass.includes("$") ? hashed_pass.split("$")[1] : '').toUpperCase();
        switch (algo) {
            case '2':
            case '2A':
                return this.bcrypt;

            case "PBKDF2":
                // will be added
                return null;

            case "ARGON2I":
                // will be added
                return null;

            case "SHA256":
                return this.sha256;

            default:
                var needle = '$AUTHME';
                var length = needle.length;
                if (length && hashed_pass.substr(hashed_pass.length - length) === needle) {
                    return this.authme;
                }
                return null;
        }
    }
    hash(passwd) {
        return this.def_algo.hash(passwd);
    }
    destruct() {
        this.con.destroy()
        this.con = null;
    }
    isUserRegistered(username,callback) {
			username = username.trim();
			this.con.query(`SELECT 1 FROM ${TABLE_NAME} WHERE name = '${username.toLowerCase()}' LIMIT 1`, (err, result, fields) =>{
                if(err) throw err
                
                callback(result.length > 0)
            });
		
	}
    isIpRegistered(address,callback)
	{
			this.con.query('SELECT 1 FROM ' + TABLE_NAME + ' WHERE address = "'+address+'" LIMIT 1', (err, result, fields) =>{
                
                callback(result.length > 0)
                
            });
		

	}
    /**
     * Changes password for player.
     *
     * @param {string} username the username
     * @param {string} password the password
     * @return {bool} true whether or not password change was successful 
     */
    changePassword(passwd, username, callback = null) {
        username = username.trim()
        var hash = this.hash(passwd)
        this.con.query(`UPDATE nlogin SET password = '${hash}' WHERE name = '${username.toLowerCase()}'`, (err, result, fields) => {
            if(callback) callback(err == null)
        })

    }
    register(username, password, email, ip, callback = null) {
        var username = username.trim()
        var email = email?email:""
        var hash = this.hash(password)
        var usernameLowerCase = username.toLowerCase()
        if(this.isUserRegistered(username)){
            this.con.query(`update ${TABLE_NAME} set email = '${email}',address='${ip}',password='${hash}' where name = '${usernameLowerCase}'`, (err, result, fields)=>{
                if(callback != null){
                    callback(false, err == null)
                }
            })
            
        }else{
            this.con.query(`insert into ${TABLE_NAME} (name,realname,address,password, email) values ('${usernameLowerCase}', '${username}', '${address}','${password}','${email}')`,(err, result, fields)=>{
                if(callback != null){
                    callback(true, err == null)
                }
            })
        }
    }
}
module.exports = nLogin