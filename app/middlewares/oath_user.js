const db = require('../../config/db');
const md5 = require('md5');
const getLocation = require("../helper/getLocationIp");
const User = db.users;

const query = require('../helper/query');

let conditions, select;

const oathUser = async (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods','POST, GET, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers','Content-Type, Option, Authorization');

    const variables = await req.body.variables;
    if ( variables ) {
        const email = variables.email;
        const password = variables.password;

        conditions = {
            email: email
        };
        select = ['salt_key'];
        let user = await query.findOneByConditions(conditions, User, select);
        if ( !user ) {
            const status = {
                code: 2 ,
                message: "Can't find email"
            };
            const dataPrivate = {
                status: status
            };
            req.dataPrivate = dataPrivate;
            next();
        }

        let passwordSaltkey = password;
        if ( user.salt_key ) passwordSaltkey = password + user.salt_key;

        conditions = {
            email: email ,
            password: md5(passwordSaltkey)
        };
        select = ['uuid'];
        user = await query.findOneByConditions(conditions, User, select);

        if ( user ) {
            const locations = getLocation(req);
            const nameClient = `${req.useragent.platform}, ${req.useragent.browser}`;
            const status = {
                code: 1 ,
                message: "Login Success"
            };
            const dataPrivate = {
                status: status ,
                uuid: user.uuid ,
                locations: locations ,
                nameClient: nameClient
            };
            req.dataPrivate = dataPrivate;
            next();
        } else {
            const status = {
                code: 2 ,
                message: "Wrong password"
            };
            const dataPrivate = {
                status: status
            };
            req.dataPrivate = dataPrivate;
            next();
        }
    } else {
        const status = {
            code: 4 ,
            message: "Wrong format"
        };
        const dataPrivate = {
            status: status
        };
        req.dataPrivate = dataPrivate;
        next();
    }
};

module.exports = {
    oathUser
};
