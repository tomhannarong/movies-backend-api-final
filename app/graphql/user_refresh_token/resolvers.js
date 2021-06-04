const db = require('../../../config/db');
const Oath_user_client = db.oath_user_clients
const User_refresh_token = db.user_refresh_tokens
const generatePassword = require('password-generator');
const env = require('dotenv').config();
const jwt = require("jwt-simple");
const moment = require('moment');

const resolvers = {
    Mutation: {
        updateToken: async function(_, { input }, context) {
            const genSecretKey = generatePassword(12, false);
            const updateSecret = await Oath_user_client.update(
                { secret_key: genSecretKey },{
                raw:true,
                where: {
                    id: context.oathId
                }    
            })
            const tokenPayload = {
                sub: context.uuid,
                iat: moment()
            }
            const refreshPayload = {
                sub: context.uuid,
                iat: moment()
            }
            const token = jwt.encode(tokenPayload, genSecretKey + process.env.secret_key)
            const refresh = jwt.encode(refreshPayload, process.env.secret_key + genSecretKey)
            const updateToken = await User_refresh_token.update({ 
                token: token, 
                refresh: refresh,
                token_expire_at: moment().add(60,'minutes').format("YYYY-MM-DD HH:mm:ss"),
                refresh_expire_at: moment().add(7,'days').format("YYYY-MM-DD HH:mm:ss")
             },{
                //raw:true,
                where: {
                    id: context.refreshId
                }    
            })
            const dataToken = {
                token: token ,
                refresh: refresh ,
                is_active: context.isActive ,
                message: "success"
            }
            return {
                results: dataToken,
                status: {
                    status: true ,
                    message: "success"
                }
            }
            
        }
    }
};

module.exports = resolvers;

