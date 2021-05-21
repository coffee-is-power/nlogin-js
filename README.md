
# nlogin-js

  

[nLogin](https://www.nickuc.com/pt/details/nlogin) database wrapper for node js

  

  

### Include library

  

```js

const  nLogin = require('nlogin')

```

It will return a class, so you need to create a new instance

```js

const  nloginInstance = new  nLogin("localhost", "tiagodinis33","password123","s12_nlogin", (err)=>{

console.log(err != null? "Connected!" : "Error connecting!")

})

```

## How do i...

### ...authenticate a user?

Just do

```js

nloginInstance.checkPassword("XtiagodinisX","tiagodinis767", (isCorrectPass)=>{

console.log(isCorrectPass?"Access granted!":"Access denied!")

})

```

### ...register a person?

```js

nloginInstance.register("username","password","email","ip", null/*this is the callback but is optional, it just tells if it was successful*/)

```

### ...check if a person is registered?

```js

nloginInstance.isUserRegistered("username", (isRegistered)=>{

console.log(isRegistered?"Registered":"Not registered")

})

```

### ...check if a ip is registered?

```js

nloginInstance.isIpRegistered("ad.dr.es.s", (isRegistered)=>{

console.log(isRegistered?"Registered":"Not registered")

})

```

### ...change the password of a user?

```js

nloginInstance.changePassword("newPassword", "XtiagodinisX", callback  /*Optional*/)

```

# Thanks NickUC for doing this amazing login plugin <3