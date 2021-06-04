const db = require('../../../config/db');
const Op = db.Sequelize.Op;
const sequelize = db.sequelize;
const Package = db.packages;
const User = db.users;
const Customer = db.customers;

const { v4: uuidv4 } = require('uuid');

const query = require('../../helper/query');
const functions = require('../../helper/functions');

let conditions, select, order, data;
let page = 1;
let limit = 10;
let checkPermission = false;

const resolvers = {
    Query: {
        getPackage: async (_, { input }, { context }) => {
            if (input.page) page = input.page;
            if (input.limit) limit = input.limit;
            let keyword = input.keyword;

            try {
                if (context.isAdmin == 1) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 7) {
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
                    customer_id: context.customerId
                };
                if (keyword) {
                    conditions = {
                        status_delete: 0,
                        customer_id: context.customerId,
                        [Op.or]: {
                            name: { [Op.regexp]: keyword },
                            price: { [Op.regexp]: keyword }
                        }
                    };
                }
                const total = await query.countDataRows(conditions, Package);
                if (total == 0) {
                    return {
                        status: {
                            code: 2,
                            message: "Not found data in database!"
                        },
                        result: {}
                    };
                }

                select = ['uuid', 'name', 'price', 'days', 'max_quality', 'limit_device', 'created_by', 'updated_by', 'created_at'];
                order = [
                    ['created_at', 'DESC']
                ];
                const packages = await query.findAllLimitByConditions(conditions, Package, select, [], order, page, limit);

                for (const item of packages) {
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

                    item.package_uuid = item.uuid;
                    item.package_name = item.name;
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


                conditions = {
                    status_delete: 0,
                    id: context.customerId
                };
                select = ['limit_package'];
                const customerLimitPackage = await query.findOneByConditions(conditions, Customer, select);

                return {
                    status: {
                        code: 1,
                        message: "Success"
                    },
                    result: {
                        total: total,
                        pagination: pagination,
                        data: packages,
                        limit_package: customerLimitPackage.limit_package
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
        getPackageByUuid: async (_, { packageUuid }, { context }) => {
            try {
                if (context.isAdmin == 1) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 7) {
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
                    uuid: packageUuid,
                    customer_id: context.customerId
                };
                select = ['name', 'price', 'days', 'max_quality', 'limit_device', 'created_by', 'updated_by'];
                const package = await query.findOneByConditions(conditions, Package, select);
                console.log("package")
                console.log(package)
                if (!package) {
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
                if (package.created_by) {
                    conditions = {
                        status_delete: 0,
                        id: package.created_by
                    };
                    createdBy = await query.findOneByConditions(conditions, User, select);
                }
                let updatedBy;
                if (package.updated_by) {
                    conditions = {
                        status_delete: 0,
                        id: package.updated_by
                    };
                    updatedBy = await query.findOneByConditions(conditions, User, select);
                }

                data = {
                    package_uuid: packageUuid,
                    package_name: package.name,
                    price: package.price,
                    days: package.days,
                    max_quality: package.max_quality,
                    limit_device: package.limit_device,
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
        createPackage: async (_, { input }, { context }) => {
            const packageName = input.package_name;
            const price = input.price;
            const days = input.days;
            const maxQuality = input.max_quality;
            const limitDevice = input.limit_device;

            try {
                if (context.isAdmin == 1) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 7) {
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

                if ((limitDevice > 4) || (limitDevice == 0) || (limitDevice < 0)) {
                    console.log("limitDevice");
                    return {
                        status: {
                            code: 2,
                            message: "Limit Package invalid!"
                        },
                        result: {}
                    };
                }

                const quality = ['SD', 'HD', 'FHD', '2K', '4K'];
                const checkQualiuty = quality.includes(maxQuality);
                if (!checkQualiuty) {
                    return {
                        status: {
                            code: 2,
                            message: "Quality invalid!"
                        },
                        result: {}
                    };
                }

                conditions = {
                    status_delete: 0,
                    id: context.customerId
                };
                select = ['limit_package'];
                const customerLimitPackage = await query.findOneByConditions(conditions, Customer, select);
                conditions = {
                    status_delete: 0,
                    customer_id: context.customerId
                };
                const countPackages = await query.countDataRows(conditions, Package)
                if (countPackages >= customerLimitPackage.limit_package) {
                    return {
                        status: {
                            code: 2,
                            message: "package exceed !"
                        },
                        result: {}
                    };
                }

                conditions = {
                    status_delete: 0,
                    customer_id: context.customerId,
                    name: packageName
                };
                const checkPackage = await query.countDataRows(conditions, Package);
                if (checkPackage > 0) {
                    let duplicate = {
                        name: 0
                    }
                    duplicate.name = 1;
                    return {
                        status: {
                            code: 2,
                            message: "Duplicate! Name"
                        },
                        result: {
                            duplicate: duplicate
                        }
                    };
                }

                data = {
                    uuid: uuidv4(),
                    name: packageName,
                    max_quality: maxQuality,
                    price: price,
                    days: days,
                    limit_device: limitDevice,
                    customer_id: context.customerId,
                    created_by: context.userId
                };
                let createPackage = await Package.create(data);
                createPackage = createPackage.get({ plain: true });

                data = {
                    package_uuid: createPackage.uuid,
                    package_name: createPackage.name,
                    price: createPackage.price,
                    days: createPackage.days,
                    max_quality: createPackage.max_quality,
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
        updatePackage: async (_, { input }, { context }) => {
            const packageUuid = input.package_uuid;
            const packageName = input.package_name;
            const price = input.price;
            const days = input.days;
            const maxQuality = input.max_quality;
            const limitDevice = input.limit_device;

            try {
                if (context.isAdmin == 1) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 7) {
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

                if ((limitDevice > 4) || (limitDevice == 0) || (limitDevice < 0)) {
                    console.log("limitDevice");
                    return {
                        status: {
                            code: 2,
                            message: "Limit Package invalid!"
                        },
                        result: {}
                    };
                }

                const quality = ['SD', 'HD', 'FHD', '2K', '4K'];
                const checkQualiuty = quality.includes(maxQuality);
                if (!checkQualiuty) {
                    return {
                        status: {
                            code: 2,
                            message: "Quality invalid!"
                        },
                        result: {}
                    };
                }


                conditions = {
                    status_delete: 0,
                    uuid: packageUuid,
                    customer_id: context.customerId
                };
                select = ['name', 'price', 'days', 'max_quality', 'limit_device'];
                const oldPackage = await query.findOneByConditions(conditions, Package, select);
                if (!oldPackage) {
                    return {
                        status: {
                            code: 2,
                            message: "Not found data in database!"
                        },
                        result: {}
                    };
                }
                if ((oldPackage.name == packageName) && (oldPackage.price == price) && (oldPackage.days === days) && (oldPackage.max_quality === maxQuality) && (oldPackage.limit_device === limitDevice)) {
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
                    customer_id: context.customerId,
                    name: packageName,
                    uuid: { [Op.ne]: packageUuid }
                };
                const checkPackage = await query.countDataRows(conditions, Package);
                if (checkPackage > 0) {
                    let duplicate = {
                        name: 0
                    }
                    duplicate.name = 1;
                    return {
                        status: {
                            code: 2,
                            message: "Duplicate! Name"
                        },
                        result: {
                            duplicate: duplicate
                        }
                    };
                }

                data = {
                    name: packageName,
                    price: price,
                    days: days,
                    max_quality: maxQuality,
                    limit_device: limitDevice,
                    updated_by: context.userId,
                    updated_at: functions.dateTimeNow()
                };
                await Package.update(data, { where: { uuid: packageUuid } });

                data = {
                    package_uuid: packageUuid,
                    package_name: packageName,
                    price: price,
                    days: days,
                    max_quality: maxQuality,
                    limit_device: limitDevice,
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
        deletePackage: async (_, { packageUuid }, { context }) => {
            try {
                if (context.isAdmin == 1) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 7) {
                        checkPermission = true;
                        break;
                    }
                }
                if (!checkPermission) {
                    return {
                        status: {
                            code: 2,
                            message: "Permission denied!"
                        }
                    };
                }

                conditions = {
                    status_delete: 0,
                    uuid: packageUuid,
                    customer_id: context.customerId
                };
                const checkPackage = await query.countDataRows(conditions, Package);
                if (checkPackage == 0) {
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
                await Package.update(data, { where: { uuid: packageUuid } });

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