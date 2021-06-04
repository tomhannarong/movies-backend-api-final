const jwt = require('jsonwebtoken');

const decodeJWT = (token, publicKey, saltKey, expire)=>{
    const decoded = jwt.verify(token, publicKey + saltKey, function(err, decoded) {
        if(err){
            decoded = false;
            return decoded;
        }else{
            const now = new Date();
            if(expire >= now){
                decoded = true;
                return decoded;
            }else{
                decoded = false;
                return decoded;
            }
        }
    })
    return decoded
}
module.exports = decodeJWT