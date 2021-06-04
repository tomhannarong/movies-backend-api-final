
const env = require('dotenv').config();
const jwtDecode = require('jwt-decode');
const decodeRefresh = require("../helper/decodeRefresh")
const query = require("../helper/query")
const db = require('../../config/db');
const sequelize = db.sequelize;
const User = db.users;
const Oath_user_client = db.oath_user_clients
const User_refresh_token = db.user_refresh_tokens
const Permission = db.permissions
const Impose_menu = db.impose_menus

const validateRefresh = async (req, res, next) => {
   
    if(req.headers.authorization){
        const decode = jwtDecode(req.headers.authorization);
            const condition = {
                uuid: decode.sub
            }
        const join = [
            { model: User_refresh_token, attributes: [], require: true } 
        ]
        const select = [
            [sequelize.col('user_refresh_token.id'), 'user_refresh_token_id'],
            [sequelize.col('oath_user_clients.id'), 'oath_user_clients_id'],
            [sequelize.col('oath_user_clients.uuid'), 'uuid'],
            [sequelize.col('oath_user_clients.secret_key'), 'secret_key'],
            [sequelize.col('oath_user_clients.is_active'), 'is_active'],
            [sequelize.col('user_refresh_token.refresh_expire_at'), 'refresh_expire_at']
        ] 
        const dataClient = await query.findOneByConditions(condition, Oath_user_client, select, join)
        const jwtValid = decodeRefresh(req.headers.authorization, dataClient.secret_key ,process.env.secret_key, dataClient.refresh_expire_at);
        console.log(jwtValid);

        if(jwtValid.code !== 401){
            req.oathId = dataClient.oath_user_clients_id;
            req.refreshId = dataClient.user_refresh_token_id;
            req.uuid = dataClient.uuid;
            req.isActive = dataClient.is_active;
            next()
        }
        else{
            res.status(401).send({ return : false });
        }
        
    
    }else{
        res.status(400).send({ return : false });
    }
}
module.exports = {
    validateRefresh
};
