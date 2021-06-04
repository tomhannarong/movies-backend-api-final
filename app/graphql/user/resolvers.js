const db = require('../../../config/db');
const Op = db.Sequelize.Op;
const sequelize = db.sequelize;
const User = db.users;
const Role = db.roles;

const generatePassword = require('password-generator');
const md5 = require('md5');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const config = require('config');
const baseUrl = config.baseUrl;
const rootPath = config.rootPath;

const query = require('../../helper/query');
const functions = require('../../helper/functions');

let conditions, select, join, order, data;
let page = 1;
let limit = 10;

const resolvers = {
    Query: {
        getUser: async (_, { input }, { context }) => {
            if (input.page) page = input.page;
            if (input.limit) limit = input.limit;
            let keyword = input.keyword;

            try {
                if (context.isAdmin > 1) {
                    return {
                        status: {
                            code: 2,
                            message: "Permission denied!"
                        },
                        result: {}
                    };
                }

                conditions = {
                    status_delete: 0,
                    is_admin: 2,
                    customer_id: context.customerId
                };
                if (keyword) {
                    conditions = {
                        status_delete: 0,
                        is_admin: 2,
                        customer_id: context.customerId,
                        [Op.or]: {
                            name: { [Op.regexp]: keyword },
                            email: { [Op.regexp]: keyword }
                        }
                    };
                }
                if (context.isAdmin == 0) {
                    conditions = {
                        status_delete: 0,
                        is_admin: 3
                    };
                    if (keyword) {
                        conditions = {
                            status_delete: 0,
                            is_admin: 3,
                            [Op.or]: {
                                name: { [Op.regexp]: keyword },
                                email: { [Op.regexp]: keyword }
                            }
                        };
                    }
                }

                const total = await query.countDataRows(conditions, User);
                if (total == 0) {
                    return {
                        status: {
                            code: 2,
                            message: "Not found data in database!"
                        },
                        result: {}
                    };
                }

                select = [
                    [sequelize.col('users.uuid'), 'user_uuid'],
                    [sequelize.col('users.name'), 'user_name'],
                    [sequelize.col('users.avatar'), 'user_avatar'],
                    [sequelize.col('users.email'), 'user_email'],
                    [sequelize.col('users.is_active'), 'user_is_active'],
                    [sequelize.col('users.created_by'), 'created_by'],
                    [sequelize.col('users.updated_by'), 'updated_by'],
                    [sequelize.col('role.id'), 'role_id'],
                    [sequelize.col('role.name'), 'role_name']
                ];
                join = [
                    { model: Role, attributes: [], require: true }
                ];
                order = [
                    ['created_at', 'DESC']
                ];
                const users = await query.findAllLimitByConditions(conditions, User, select, join, order, page, limit);

                for (const item of users) {
                    let userAvatar = `${baseUrl}/img/no-avatar.jpg`;
                    if (item.user_avatar) {
                        userAvatar = `${baseUrl}/${item.user_avatar}`;
                    }

                    select = [
                        [sequelize.col('users.uuid'), 'user_uuid'],
                        [sequelize.col('users.name'), 'user_name']
                    ];
                    let createdBy;
                    if (item.created_by) {
                        conditions = {
                            status_delete: 0,
                            id: item.created_by
                        };
                        createdBy = await query.findOneByConditions(conditions, User, select);
                    }
                    let updatedBy;
                    if (item.updated_by) {
                        conditions = {
                            status_delete: 0,
                            id: item.updated_by
                        };
                        updatedBy = await query.findOneByConditions(conditions, User, select);
                    }

                    item.user_avatar = userAvatar;
                    item.user_role = {
                        role_id: item.role_id,
                        role_name: item.role_name
                    };
                    item.created_by = createdBy;
                    item.updated_by = updatedBy;
                }

                let previous = page - 1;
                let next = 0;
                if ((page * limit) < total) next = page + 1;
                const pagination = {
                    limit: limit,
                    current_page: page,
                    previous_page: previous,
                    next_page: next
                };

                return {
                    status: {
                        code: 1,
                        message: "Success"
                    },
                    result: {
                        total: total,
                        pagination: pagination,
                        data: users
                    }
                };
            } catch (error) {
                return {
                    status: {
                        code: 2,
                        message: error
                    },
                    result: {}
                };
            }
        }
    },
    Mutation: {
        createUser: async (_, { input }, { context }) => {
            const userName = input.user_name;
            const avatar = input.avatar;
            const userEmail = input.user_email;
            const password = input.password;
            const roleId = input.role_id;
            const saltKey = generatePassword(12, false);
            const passwordSaltKey = password + saltKey;

            try {
                const checkBase64 = await functions.checkBase64(avatar);
                if (!checkBase64 && avatar) {
                    return {
                        status: {
                            code: 2,
                            message: "Wrong format base64!"
                        },
                        result: {}
                    };
                }

                if (context.isAdmin > 1) {
                    return {
                        status: {
                            code: 2,
                            message: "Permission denied!"
                        },
                        result: {}
                    };
                }

                conditions = {
                    status_delete: 0,
                    email: userEmail
                };
                const checkUser = await query.countDataRows(conditions, User);
                if (checkUser > 0) {
                    let duplicate = {
                        email: 0
                    };
                    duplicate.email = 1;
                    return {
                        status: {
                            code: 2,
                            message: "Duplicate! Email"
                        },
                        result: {
                            duplicate: duplicate
                        }
                    };
                }

                const userUuid = uuidv4();
                let subPath, fileName;
                if (avatar) {
                    const matches = avatar.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
                    const type = matches[1];
                    const imageBuffer = new Buffer(matches[2], 'base64');
                    subPath = `avatar/${userUuid.substr(0, 8)}`;
                    fileName = `${generatePassword(10, false)}.${type}`;
                    if (!fs.existsSync(`${rootPath}/${subPath}`)) fs.mkdirSync(`${rootPath}/${subPath}`);
                    fs.writeFileSync(`${rootPath}/${subPath}/${fileName}`, imageBuffer);
                }

                data = {
                    uuid: userUuid,
                    name: userName,
                    email: userEmail,
                    password: md5(passwordSaltKey),
                    salt_key: saltKey,
                    is_admin: 2,
                    customer_id: context.customerId,
                    role_id: roleId,
                    created_by: context.userId
                };
                if (avatar) data.avatar = `${subPath}/${fileName}`
                if (context.isAdmin == 0) data.is_admin = 3;
                let createUser = await User.create(data);
                createUser = createUser.get({ plain: true });

                conditions = {
                    status_delete: 0,
                    id: roleId
                };
                select = [
                    [sequelize.col('roles.id'), 'role_id'],
                    [sequelize.col('roles.name'), 'role_name']
                ];
                const userRole = await query.findOneByConditions(conditions, Role, select);

                let userAvatar = `${baseUrl}/img/no-avatar.jpg`;
                if (createUser.avatar) {
                    userAvatar = `${baseUrl}/${createUser.avatar}`;
                }

                data = {
                    user_uuid: data.uuid,
                    user_name: userName,
                    user_avatar: userAvatar,
                    user_email: userEmail,
                    user_role: userRole,
                    created_by: {
                        user_uuid: context.userUuid,
                        user_name: context.userName
                    }
                };

                return {
                    status: {
                        code: 1,
                        message: "Success"
                    },
                    result: {
                        data: data
                    }
                };
            } catch (error) {
                return {
                    status: {
                        code: 2,
                        message: error
                    },
                    result: {}
                };
            }
        },
        bannedUser: async (_, { userUuid }, { context }) => {
            try {
                if (context.isAdmin > 1) {
                    return {
                        status: {
                            code: 2,
                            message: "Permission denied!"
                        },
                        result: {}
                    };
                }

                conditions = {
                    status_delete: 0,
                    uuid: userUuid,
                    customer_id: context.customerId
                };
                const user = await query.findOneByConditions(conditions, User);
                if (!user) {
                    return {
                        status: {
                            code: 2,
                            message: "Not found data in database!"
                        },
                        result: {}
                    };
                }

                if (user.is_active == 0) {
                    data = {
                        is_active: 1,
                        updated_by: context.userId,
                        updated_at: functions.dateTimeNow()
                    };
                } else {
                    data = {
                        is_active: 0,
                        updated_by: context.userId,
                        updated_at: functions.dateTimeNow()
                    };
                }
                await User.update(data, { where: { uuid: userUuid } });

                let avatar = `${baseUrl}/img/no-avatar.jpg`;
                if (user.avatar) {
                    avatar = `${baseUrl}/${user.avatar}`;
                }

                conditions = {
                    status_delete: 0,
                    id: user.role_id
                };
                select = [
                    [sequelize.col('roles.id'), 'role_id'],
                    [sequelize.col('roles.name'), 'role_name']
                ];
                const userRole = await query.findOneByConditions(conditions, Role, select);

                data = {
                    user_uuid: userUuid,
                    user_name: user.name,
                    user_avatar: avatar,
                    user_email: user.email,
                    user_is_active: user.is_active,
                    user_role: userRole,
                    updated_by: {
                        user_uuid: context.userUuid,
                        user_name: context.userName
                    }
                };

                return {
                    status: {
                        code: 1,
                        message: "Success"
                    },
                    result: {
                        data: data
                    }
                };
            } catch (error) {
                return {
                    status: {
                        code: 2,
                        message: error
                    },
                    result: {}
                };
            }
        },
        updateUser: async (_, { input }, { context }) => {
            try {
                const userUuid = input.user_uuid;
                const roleId = input.role_id;

                if (context.isAdmin > 1) {
                    return {
                        status: {
                            code: 2,
                            message: "Permission denied!"
                        },
                        result: {}
                    };
                }

                conditions = {
                    status_delete: 0,
                    uuid: userUuid,
                    customer_id: context.customerId
                };
                const user = await query.findOneByConditions(conditions, User);
                if (user == 0) {
                    return {
                        status: {
                            code: 2,
                            message: "Not found data in database!"
                        },
                        result: {}
                    };
                }

                if (user.role_id == roleId) {
                    return {
                        status: {
                            code: 2,
                            message: "No data change!"
                        },
                        result: {}
                    };
                }

                data = {
                    role_id: roleId,
                    updated_by: context.userId
                };
                await User.update(data, { where: { uuid: userUuid } });

                let avatar = `${baseUrl}/img/no-avatar.jpg`;
                if (user.avatar) {
                    avatar = `${baseUrl}/${user.avatar}`;
                }

                conditions = {
                    status_delete: 0,
                    id: roleId
                };
                select = [
                    [sequelize.col('roles.id'), 'role_id'],
                    [sequelize.col('roles.name'), 'role_name']
                ];
                const userRole = await query.findOneByConditions(conditions, Role, select);

                data = {
                    user_uuid: userUuid,
                    user_name: user.name,
                    user_avatar: avatar,
                    user_email: user.email,
                    user_is_active: user.is_active,
                    user_role: userRole,
                    updated_by: {
                        user_uuid: context.userUuid,
                        user_name: context.userName
                    }
                };

                return {
                    status: {
                        code: 1,
                        message: "Success"
                    },
                    result: {
                        data: data
                    }
                };
            } catch (error) {
                return {
                    status: {
                        code: 2,
                        message: error
                    },
                    result: {}
                };
            }
        },
        deleteUser: async (_, { userUuid }, { context }) => {
            try {
                if (context.isAdmin > 1) {
                    return {
                        status: {
                            code: 2,
                            message: "Permission denied!"
                        },
                        result: {}
                    };
                }

                conditions = {
                    status_delete: 0,
                    uuid: userUuid,
                    customer_id: context.customerId
                };
                const checkUser = await query.countDataRows(conditions, User);
                if (checkUser == 0) {
                    return {
                        status: {
                            code: 2,
                            message: "Not found data in database!"
                        }
                    };
                }

                data = {
                    status_delete: 1,
                    deleted_by: context.userId,
                    deleted_at: functions.dateTimeNow()
                };
                await User.update(data, { where: { uuid: userUuid } });

                return {
                    status: {
                        code: 1,
                        message: "Success"
                    }
                };
            } catch (error) {
                return {
                    status: {
                        code: 2,
                        message: error
                    }
                };
            }
        }
    }
};

module.exports = resolvers;