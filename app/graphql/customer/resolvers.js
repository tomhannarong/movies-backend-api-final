const db = require('../../../config/db');
const Op = db.Sequelize.Op;
const sequelize = db.sequelize;
const Customer = db.customers;
const User = db.users;
const Province = db.provinces;
const Amphure = db.amphures;
const Package = db.packages;
const Role = db.roles;
const Permission = db.permissions;

const generatePassword = require('password-generator');
const md5 = require('md5');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const config = require('config');
const rootPath = config.rootPath;

const query = require('../../helper/query');
const functions = require('../../helper/functions');

let conditions, select, join, order, data;
let page = 1;
let limit = 10;
let checkPermission = false;

const resolvers = {
    Query: {
        getCustomer: async (_, { input }, { context }) => {
            if (input.page) page = input.page;
            if (input.limit) limit = input.limit;
            let keyword = input.keyword;

            try {
                if (context.isAdmin == 0) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 5) {
                        checkPermission = true;
                        break;
                    }
                }
                if (!checkPermission) {
                    return {
                        status: {
                            code: 2,
                            message: "Permission denied!"
                        },
                        result: {}
                    };
                }

                conditions = {
                    status_delete: 0
                };
                if (keyword) {
                    conditions = {
                        status_delete: 0,
                        [Op.or]: {
                            name: { [Op.regexp]: keyword },
                            domain: { [Op.regexp]: keyword }
                        }
                    };
                }
                const total = await query.countDataRows(conditions, Customer);
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
                    [sequelize.col('customers.uuid'), 'customer_uuid'],
                    [sequelize.col('customers.name'), 'customer_name'],
                    [sequelize.col('customers.domain'), 'domain'],
                    [sequelize.col('customers.ip_address'), 'ip_address'],
                    [sequelize.col('customers.tel'), 'tel'],
                    [sequelize.col('customers.address'), 'address'],
                    [sequelize.col('customers.limit_package'), 'limit_package'],
                    [sequelize.col('customers.created_by'), 'created_by'],
                    [sequelize.col('customers.updated_by'), 'updated_by'],
                    [sequelize.col('province.id'), 'province_id'],
                    [sequelize.col('province.name'), 'province_name'],
                    [sequelize.col('province.name_en'), 'province_name_en'],
                    [sequelize.col('amphure.id'), 'amphure_id'],
                    [sequelize.col('amphure.name'), 'amphure_name'],
                    [sequelize.col('amphure.name_en'), 'amphure_name_en']
                ];
                join = [
                    { model: Province, attributes: [], require: true },
                    { model: Amphure, attributes: [], require: true }
                ];
                order = [
                    ['created_at', 'DESC']
                ];
                const customers = await query.findAllLimitByConditions(conditions, Customer, select, join, order, page, limit);

                for (const item of customers) {
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

                    item.province = {
                        province_id: item.province_id,
                        province_name: item.province_name,
                        province_name_en: item.province_name_en
                    };
                    item.amphure = {
                        amphure_id: item.amphure_id,
                        amphure_name: item.amphure_name,
                        amphure_name_en: item.amphure_name_en
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
                        data: customers
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
        getCustomerByUuid: async (_, { customerUuid }, { context }) => {
            try {
                if (context.isAdmin == 0) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 5) {
                        checkPermission = true;
                        break;
                    }
                }
                if (!checkPermission) {
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
                    uuid: customerUuid
                };
                select = [
                    [sequelize.col('customers.name'), 'customer_name'],
                    [sequelize.col('customers.domain'), 'domain'],
                    [sequelize.col('customers.ip_address'), 'ip_address'],
                    [sequelize.col('customers.tel'), 'tel'],
                    [sequelize.col('customers.address'), 'address'],
                    [sequelize.col('customers.limit_package'), 'limit_package'],
                    [sequelize.col('customers.created_by'), 'created_by'],
                    [sequelize.col('customers.updated_by'), 'updated_by'],
                    [sequelize.col('province.id'), 'province_id'],
                    [sequelize.col('province.name'), 'province_name'],
                    [sequelize.col('province.name_en'), 'province_name_en'],
                    [sequelize.col('amphure.id'), 'amphure_id'],
                    [sequelize.col('amphure.name'), 'amphure_name'],
                    [sequelize.col('amphure.name_en'), 'amphure_name_en'],
                    [sequelize.col('amphure.code'), 'amphure_postcode']
                ];
                join = [
                    { model: Province, attributes: [], require: true },
                    { model: Amphure, attributes: [], require: true }
                ];
                const customer = await query.findOneByConditions(conditions, Customer, select, join);
                if (!customer) {
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
                    [sequelize.col('users.name'), 'user_name']
                ];
                let createdBy;
                if (customer.created_by) {
                    conditions = {
                        status_delete: 0,
                        id: customer.created_by
                    };
                    createdBy = await query.findOneByConditions(conditions, User, select);
                }
                let updatedBy;
                if (customer.updated_by) {
                    conditions = {
                        status_delete: 0,
                        id: customer.updated_by
                    };
                    updatedBy = await query.findOneByConditions(conditions, User, select);
                }

                data = {
                    customer_uuid: customerUuid,
                    customer_name: customer.customer_name,
                    domain: customer.domain,
                    ip_address: customer.ip_address,
                    tel: customer.tel,
                    address: customer.address,
                    limit_package: customer.limit_package,
                    province: {
                        province_id: customer.province_id,
                        province_name: customer.province_name,
                        province_name_en: customer.province_name_en
                    },
                    amphure: {
                        amphure_id: customer.amphure_id,
                        amphure_name: customer.amphure_name,
                        amphure_name_en: customer.amphure_name_en,
                        amphure_postcode: customer.amphure_postcode
                    },
                    created_by: createdBy,
                    updated_by: updatedBy
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
        }
    },
    Mutation: {
        createCustomer: async (_, { input }, { context }) => {
            const customerName = input.customer_name;
            const domain = input.domain;
            const ipAddress = input.ip_address;
            const tel = input.tel;
            const address = input.address;
            const provinceId = input.province_id;
            const amphureId = input.amphure_id;
            const userName = input.user_name;
            const avatar = input.avatar;
            const email = input.email;
            const password = input.password;
            const saltKey = generatePassword(12, false);
            const passwordSaltKey = password + saltKey;
            const limitPackage = input.limit_package;

            try {
                if (context.isAdmin == 0) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 5) {
                        checkPermission = true;
                        break;
                    }
                }
                if (!checkPermission) {
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
                    [Op.or]: {
                        name: customerName,
                        domain: domain,
                        ip_address: ipAddress
                    }
                };
                const checkCustomers = await query.findAllByConditions(conditions, Customer);
                console.log(checkCustomers)
                conditions = {
                    status_delete: 0,
                    email: email
                }
                const checkUsers = await query.findAllByConditions(conditions, User);

                if (checkCustomers.length > 0 || checkUsers.length > 0 || (limitPackage > 5 || limitPackage < 3)) {
                    let duplicate = {
                        customer_name: 0,
                        domain: 0,
                        ip_address: 0,
                        email: 0,
                    }
                    for (const checkCustomer of checkCustomers) {
                        if (checkCustomer.name == customerName) duplicate.customer_name = 1;
                        if (checkCustomer.domain == domain) duplicate.domain = 1;
                        if (checkCustomer.ip_address == ipAddress) duplicate.ip_address = 1;
                    }
                    for (const checkUser of checkUsers) {
                        if (checkUser.email == email) duplicate.email = 1;
                    }

                    let messageDuplicate = "";
                    if (checkCustomers.length > 0 || checkUsers.length > 0) {
                        messageDuplicate = "Duplicate! ";
                        if (duplicate.customer_name === 1) messageDuplicate = messageDuplicate + " Customer Name,";
                        if (duplicate.domain === 1) messageDuplicate = messageDuplicate + " Domain,";
                        if (duplicate.ip_address === 1) messageDuplicate = messageDuplicate + " IP Address,";
                        if (duplicate.email === 1) messageDuplicate = messageDuplicate + " Email,";
                        messageDuplicate = messageDuplicate.substr(0, messageDuplicate.length - 1);
                    } else if ((limitPackage > 5 || limitPackage < 3)) {
                        messageDuplicate = "Package invalid !";
                    }

                    return {
                        status: {
                            code: 2,
                            message: `${messageDuplicate}`
                        },
                        result: {
                            duplicate: duplicate
                        }
                    };
                }

                const customerUuid = uuidv4();
                data = {
                    uuid: customerUuid,
                    name: customerName,
                    domain: domain,
                    ip_address: ipAddress,
                    tel: tel,
                    address: address,
                    limit_package: limitPackage,
                    province_id: provinceId,
                    amphure_id: amphureId,
                    created_by: context.userId
                };
                let createCustomer = await Customer.create(data);
                createCustomer = createCustomer.get({ plain: true });

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
                    email: email,
                    password: md5(passwordSaltKey),
                    salt_key: saltKey,
                    is_admin: 1,
                    customer_id: createCustomer.id,
                    created_by: context.userId
                }
                if (avatar) data.avatar = `${subPath}/${fileName}`;
                let createUser = await User.create(data);
                createUser = createUser.get({ plain: true });

                data = {
                    uuid: uuidv4(),
                    name: 'Free Package',
                    customer_id: createCustomer.id,
                    created_by: context.userId
                };
                await Package.create(data);

                data = {
                    name: 'All Permissions',
                    created_by: createUser.id
                };
                let createRole = await Role.create(data);
                createRole = createRole.get({ plain: true });

                const listMenuId = [1, 2, 3, 7, 9];
                for (const item of listMenuId) {
                    data = {
                        role_id: createRole.id,
                        impose_menu_id: item
                    };
                    await Permission.create(data);
                }

                const province = await query.getProvince(input.province_id);
                const amphure = await query.getAmphure(input.amphure_id);

                data = {
                    customer_uuid: createCustomer.uuid,
                    customer_name: createCustomer.name,
                    domain: createCustomer.domain,
                    ip_address: createCustomer.ip_address,
                    tel: createCustomer.tel,
                    address: createCustomer.address,
                    limit_package: createCustomer.limit_package,
                    province: province,
                    amphure: amphure,
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
        updateCustomer: async (_, { input }, { context }) => {
            const customerUuid = input.customer_uuid;
            const customerName = input.customer_name;
            const domain = input.domain;
            const ipAddress = input.ip_address;
            const tel = input.tel;
            const address = input.address;
            const provinceId = input.province_id;
            const amphureId = input.amphure_id;
            const limitPackage = input.limit_package;
            try {
                if (context.isAdmin == 0) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 5) {
                        checkPermission = true;
                        break;
                    }
                }
                if (!checkPermission) {
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
                    uuid: customerUuid
                };
                select = ['name', 'domain', 'ip_address', 'tel', 'address', 'limit_package', 'province_id', 'amphure_id'];
                const oldCustomer = await query.findOneByConditions(conditions, Customer, select);
                if (!oldCustomer) {
                    return {
                        status: {
                            code: 2,
                            message: "Not found data in database!"
                        },
                        result: {}
                    };
                }

                if (
                    oldCustomer.name == customerName && oldCustomer.domain == domain &&
                    oldCustomer.ip_address == ipAddress && oldCustomer.tel == tel &&
                    oldCustomer.address == address && oldCustomer.limit_package == limitPackage
                    && oldCustomer.province_id == provinceId &&
                    oldCustomer.amphure_id == amphureId
                ) {
                    return {
                        status: {
                            code: 2,
                            message: "No data change!"
                        },
                        result: {}
                    };
                }

                conditions = {
                    status_delete: 0,
                    [Op.or]: {
                        name: customerName,
                        domain: domain,
                        ip_address: ipAddress,
                    },
                    uuid: { [Op.ne]: customerUuid }
                };
                const checkCustomers = await query.findAllByConditions(conditions, Customer);


                if (checkCustomers.length > 0 || (limitPackage > 5 || limitPackage < 3)) {
                    let duplicate = {
                        customer_name: 0,
                        domain: 0,
                        ip_address: 0,
                    }
                    for (const checkCustomer of checkCustomers) {
                        if (checkCustomer.name == customerName) duplicate.customer_name = 1;
                        if (checkCustomer.domain == domain) duplicate.domain = 1;
                        if (checkCustomer.ip_address == ipAddress) duplicate.ip_address = 1;

                    }
                    let messageDuplicate = "";
                    if (checkCustomers.length > 0) {
                        messageDuplicate = "Duplicate! ";
                        if (duplicate.customer_name == 1) messageDuplicate = messageDuplicate + " Customer Name,";
                        if (duplicate.domain == 1) messageDuplicate = messageDuplicate + " Domain,";
                        if (duplicate.ip_address == 1) messageDuplicate = messageDuplicate + " IP Address,";
                        messageDuplicate = messageDuplicate.substr(0, messageDuplicate.length - 1);
                    } else if ((limitPackage > 5 || limitPackage < 3)) {
                        messageDuplicate = "Package invalid !";
                    }
                    return {
                        status: {
                            code: 2,
                            message: `${messageDuplicate}`
                        },
                        result: {
                            duplicate: duplicate
                        }
                    };
                }

                data = {
                    name: customerName,
                    domain: domain,
                    ip_address: ipAddress,
                    tel: tel,
                    address: address,
                    limit_package: limitPackage,
                    province_id: provinceId,
                    amphure_id: amphureId,
                    updated_by: context.userId,
                    updated_at: functions.dateTimeNow()
                };
                await Customer.update(data, { where: { uuid: customerUuid } });

                const province = await query.getProvince(provinceId);
                const amphure = await query.getAmphure(amphureId);

                data = {
                    customer_uuid: customerUuid,
                    customer_name: customerName,
                    domain: domain,
                    ip_address: ipAddress,
                    tel: tel,
                    address: address,
                    limit_package: limitPackage,
                    province: province,
                    amphure: amphure,
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
        deleteCustomer: async (_, { customerUuid }, { context }) => {
            try {
                if (context.isAdmin == 0) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 5) {
                        checkPermission = true;
                        break;
                    }
                }
                if (!checkPermission) {
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
                    uuid: customerUuid
                };
                const checkCustomer = await query.countDataRows(conditions, Customer);
                if (checkCustomer == 0) {
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
                await Customer.update(data, { where: { uuid: customerUuid } });

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