const db = require('../../../config/db');
const sequelize = db.sequelize;
const User = db.users;
const Role = db.roles;
const Customer = db.customers;

const generatePassword = require('password-generator');
const md5 = require('md5');
const fs = require('fs');
const config = require('config');
const baseUrl = config.baseUrl;
const rootPath = config.rootPath;

const query = require('../../helper/query');
const functions = require('../../helper/functions');

let conditions, select, join, data;

const resolvers = {
    Query: {
        getProfile: async (_, { }, { context }) => {
            const userId = context.userId;

            try {
                conditions = {
                    id: userId,
                };
                select = [
                    [sequelize.col('users.uuid'), 'user_uuid'],
                    [sequelize.col('users.name'), 'user_name'],
                    [sequelize.col('users.avatar'), 'avatar'],
                    [sequelize.col('users.email'), 'user_email'],
                    [sequelize.col('role.id'), 'role_id'],
                    [sequelize.col('role.name'), 'role_name'],
                    [sequelize.col('customer.name'), 'customer_name'],
                    [sequelize.col('customer.domain'), 'domain'],
                    [sequelize.col('customer.address'), 'address']
                ];
                join = [
                    { model: Customer, attributes: [], require: true },
                    { model: Role, attributes: [], require: true }
                ];
                const profile = await query.findOneByConditions(conditions, User, select, join);
                if (!profile) {
                    return {
                        status: {
                            code: 2,
                            message: "Not found data in database!"
                        },
                        result: {}
                    };
                }

                let userAvatar = `${baseUrl}/img/no-avatar.jpg`;
                if (profile.avatar) {
                    userAvatar = `${baseUrl}/${profile.avatar}`;
                }

                data = {
                    user_uuid: profile.user_uuid,
                    user_name: profile.user_name,
                    user_email: profile.user_email,
                    user_avatar: userAvatar,
                    user_role: {
                        role_id: profile.role_id,
                        role_name: profile.role_name
                    },
                    customer_name: profile.customer_name,
                    customer_domain: profile.domain,
                    customer_address: profile.address
                };

                return {
                    status: {
                        code: 1,
                        message: "Success"
                    },
                    result: data
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
        updateProfile: async (_, { input }, { context }) => {
            const userUuid = input.user_uuid;
            const userName = input.user_name;
            const avatar = input.avatar;

            try {
                const checkBase64 = await functions.checkBase64(avatar);
                if (avatar && !checkBase64) {
                    return {
                        status: {
                            code: 2,
                            message: "Wrong format base64!"
                        },
                        result: {}
                    };
                }

                conditions = {
                    status_delete: 0,
                    uuid: userUuid
                };
                select = ['name', 'avatar'];
                const oldUser = await query.findOneByConditions(conditions, User, select);
                if (!oldUser) {
                    return {
                        status: {
                            code: 2,
                            message: "Not found data in database!"
                        },
                        result: {}
                    };
                }

                if (oldUser.name == userName && !avatar) {
                    return {
                        status: {
                            code: 2,
                            message: "No data change!"
                        },
                        result: {}
                    };
                }

                let subPath, fileName;
                if (avatar) {
                    const matches = avatar.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
                    const type = matches[1];
                    const imageBuffer = new Buffer(matches[2], 'base64');
                    subPath = `avatar/${userUuid.substr(0, 8)}`;
                    fileName = `${generatePassword(10, false)}.${type}`;
                    if (oldUser.avatar) fs.unlinkSync(`${rootPath}/${oldUser.avatar}`);
                    if (!fs.existsSync(`${rootPath}/${subPath}`)) fs.mkdirSync(`${rootPath}/${subPath}`);
                    fs.writeFileSync(`${rootPath}/${subPath}/${fileName}`, imageBuffer);
                }

                data = {
                    name: userName,
                    updated_by: context.userId,
                    updated_at: functions.dateTimeNow()
                };
                if (avatar) data.avatar = `${subPath}/${fileName}`;
                await User.update(data, { where: { uuid: userUuid } });

                data = {
                    user_name: userName,
                    user_avatar: avatar ? `${baseUrl}/${subPath}/${fileName}` : oldUser.avatar ? `${baseUrl}/${oldUser.avatar}` : `${baseUrl}/img/no-avatar.jpg`
                };

                return {
                    status: {
                        code: 1,
                        message: "Success"
                    },
                    result: data
                };
            } catch (error) {
                return {
                    status: {
                        code: 2,
                        message: error
                    }
                };
            }
        },
        changePassword: async (_, { input }, { context }) => {
            const userUuid = input.user_uuid;
            const oldPassword = input.old_password;
            const newPassword = input.new_password;
            const saltKey = generatePassword(12, false);
            const newPasswordSaltKey = newPassword + saltKey;

            try {
                if (oldPassword == newPassword) {
                    let duplicate = {
                        equalPassword: 0,
                        oldPassword: 0
                    };
                    duplicate.equalPassword = 1;
                    return {
                        status: {
                            code: 2,
                            message: "New password equal old password"
                        },
                        result: {
                            duplicate: duplicate
                        }
                    };
                }

                conditions = {
                    status_delete: 0,
                    uuid: userUuid
                };
                select = ['password', 'salt_key'];
                const user = await query.findOneByConditions(conditions, User, select);
                if (!user) {
                    return {
                        status: {
                            code: 2,
                            message: "Not found data in database!"
                        }
                    };
                }

                let oldPasswordSaltkey = oldPassword;
                if (user.salt_key) oldPasswordSaltkey = oldPassword + user.salt_key;
                const oldPasswordSaltkeyMd5 = md5(oldPasswordSaltkey);
                if (oldPasswordSaltkeyMd5 != user.password) {
                    let duplicate = {
                        equalPassword: 0,
                        oldPassword: 0
                    };
                    duplicate.oldPassword = 1;
                    return {
                        status: {
                            code: 2,
                            message: "Old password don't macth"
                        },
                        result: {
                            duplicate: duplicate
                        }
                    };
                }

                data = {
                    password: md5(newPasswordSaltKey),
                    salt_key: saltKey
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