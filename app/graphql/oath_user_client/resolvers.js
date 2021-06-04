const db = require('../../../config/db');
const sequelize = db.sequelize;
const Movies = db.movies;
const Movie_category = db.movie_categories;
const Category = db.categories;
const Rate = db.rates;
const User = db.users;
const OathUserClients = db.oath_user_clients;
const UserRefreshToken = db.user_refresh_tokens;
const Permission = db.permissions;
const Impose_menu = db.impose_menus;

const generatePassword = require('password-generator');
const jwt = require("jwt-simple");
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const config = require('config');

const query = require('../../helper/query');

const baseUrl = config.baseUrl;

let conditions, select, join;

const resolvers = {
    Query: {
        getOathClient: async function(_, { uuid }) {
            const movies = await Movies.findAll({
                raw: true ,
                attributes: ['*', [sequelize.col('rate.code'), 'rate_code'], [sequelize.col('user.name'), 'crated_name'], [sequelize.col('user.uuid'), 'crated_uuid']] ,
                include: [
                    { model: Rate, attributes: [], require: true } ,
                    { model: User, attributes: [], require: true }
                ]
            });
            
            for (const movie of movies) {
                const category = await Movie_category.findAll({
                    raw:true ,
                    attributes: [[sequelize.col('category.id'), 'id'], [sequelize.col('category.name'), 'name'], [sequelize.col('category.name_en'), 'name_en']] ,
                    where: {
                        movie_id: movie.id
                    } ,
                    include: [{
                        model: Category ,
                        attributes: [] ,
                        require: true
                    }] 
                });
                movie.category = category;
            }
            return {
                results: movies ,
                response: {
                    status: true ,
                    message: "success"
                }
            }
        }
    } ,
    Mutation: {
        createOath: async function(_, {}, { context }) {
            if ( context.status.code == 1 ) {
                conditions = {
                    uuid: context.uuid
                };
                select = ['id', 'name', 'avatar', 'is_admin', 'is_active', 'role_id'];
                const user = await query.findOneByConditions(conditions, User, select);

                conditions = {
                    role_id: user.role_id
                };
                select = [
                    [sequelize.col('impose_menu.id'), 'id']
                ];
                join = [
                    { model: Impose_menu, attributes: [], require: true }
                ];
                const menus = await query.findAllByConditions(conditions, Permission, select, join);

                const menuArray = [];
                for ( const menu of menus ) {
                    menuArray.push(menu.id)
                }

                const dataClient = {
                    user_id: user.id ,
                    uuid: uuidv4() ,
                    name: context.nameClient ,
                    address: context.locations.city ,
                    secret_key: generatePassword(12, false) ,
                    ip_adress: context.locations.ip ,
                    is_active: true
                };
                
                conditions = {
                    user_id: user.id
                };
                const countOath = await query.countDataRows(conditions, OathUserClients);

                if ( countOath >= 4 ) await OathUserClients.destroy({ where: { user_id: user.id }, order: [['id', 'ASC']], limit: 1 });
                const createdOath = await OathUserClients.create(dataClient);
                const oathObj = createdOath.get({ plain: true });
                const tokenPayload = {
                    sub: oathObj.uuid ,
                    iat: moment()
                };
                const refreshPayload = {
                    sub: oathObj.uuid ,
                    iat: moment()
                };
                const token = jwt.encode(tokenPayload, oathObj.secret_key + process.env.secret_key);
                const refresh = jwt.encode(refreshPayload, process.env.secret_key + oathObj.secret_key);
                const dataToken = {
                    client_id: oathObj.id ,
                    token: token ,
                    refresh: refresh ,
                    token_expire_at: moment().add(60,'minutes').format("YYYY-MM-DD HH:mm:ss") ,
                    refresh_expire_at: moment().add(7,'days').format("YYYY-MM-DD HH:mm:ss")
                };
                
                let userAvatar = `${baseUrl}/img/no-avatar.jpg`;
                if ( user.avatar ) {
                    userAvatar = `${baseUrl}/${user.avatar}`;
                }
                const createdToken = await UserRefreshToken.create(dataToken);
                const tokenObj = {
                    token: createdToken.token ,
                    refresh: createdToken.refresh ,
                    name: user.name ,
                    avatar: userAvatar ,
                    menus: menuArray ,
                    is_admin: user.is_admin ,
                    is_active: oathObj.is_active
                };

                return {
                    status: {
                        code: context.status.code ,
                        message: context.status.message
                    } ,
                    result: tokenObj
                };
            } else {
                return {
                    status: {
                        code: context.status.code ,
                        message: context.status.message
                    } ,
                    result: {}
                };
            }
        }
    }
};

module.exports = resolvers;

