const jwt = require('jsonwebtoken');

const decodeToken = (refresh, publicKey, saltKey, expire)=>{
    const decoded = jwt.verify(refresh, saltKey + publicKey, function(err, decoded) {
        if(err){
            decoded = {
                status: false,
                code: 401 // invalid refresh token
            };
            return decoded;
        }else{
            const now = new Date();
            if(expire >= now){
                decoded = {
                    status: true,
                    code: 200 // valid
                };
                return decoded;
            }else{
                decoded = {
                    status: false,
                    code: 403 // valid refresh token but expire
                };
                return decoded;
            }
        }
    })
    return decoded
}
module.exports = decodeToken