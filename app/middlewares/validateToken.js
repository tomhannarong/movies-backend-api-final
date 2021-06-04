const env = require('dotenv').config();
const jwtDecode = require('jwt-decode');
const decodeToken = require("../helper/decodeToken");
const query = require("../helper/query");
const db = require('../../config/db');
const sequelize = db.sequelize;
const User = db.users;
const OathUserClient = db.oath_user_clients;
const UserRefreshToken = db.user_refresh_tokens;
const Permission = db.permissions;
const Impose_menu = db.impose_menus;

let conditions, select, join;

const validateToken = async (req, res, next) => {
    if ( req.headers.authorization ) {
        const decode = jwtDecode(req.headers.authorization);
        conditions = {
            uuid: decode.sub
        };
        select = [
            [sequelize.col('user.id'), 'id'] ,
            [sequelize.col('user.name'), 'name'] ,
            [sequelize.col('user.is_admin'), 'is_admin'] ,
            [sequelize.col('user.is_active'), 'is_active'] ,
            [sequelize.col('user.customer_id'), 'customer_id'] ,
            [sequelize.col('user.role_id'), 'role_id'] ,
            [sequelize.col('oath_user_clients.secret_key'), 'secret_key'] ,
            [sequelize.col('user_refresh_token.token_expire_at'), 'token_expire_at']
        ];
        join = [
            { model: User, attributes: [], require: true } ,
            { model: UserRefreshToken, attributes: [], require: true }
        ];
        const dataClient = await query.findOneByConditions(conditions, OathUserClient, select, join);
        
        conditions = {
            role_id: dataClient.role_id
        };
        select = [
            [sequelize.col('impose_menu.id'), 'id'],
            [sequelize.col('impose_menu.name'), 'name'],
        ];
        join = [
            { model: Impose_menu, attributes: [], require: true }
        ];
        const dataRole = await query.findAllByConditions(conditions, Permission, select, join);
        const jwtValid = decodeToken(req.headers.authorization, dataClient.secret_key ,process.env.secret_key, dataClient.token_expire_at);
        
        if ( jwtValid ) {
            const datPrivate = {
                userId: dataClient.id ,
                userUuid: decode.sub ,
                userName: dataClient.name ,
                isAdmin: dataClient.is_admin ,
                isActive: dataClient.is_active ,
                customerId: dataClient.customer_id ,
                dataRole: dataRole
            };
            req.dataPrivate = datPrivate;
            next();
        } else {
            res.status(401).send({ return : false });
        }
    } else {
        res.status(401).send({ status : false });
    }
};

module.exports = {
    validateToken
};
