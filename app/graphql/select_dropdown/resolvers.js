const db = require('../../../config/db');
const Category = db.categories;
const Package = db.packages;
const Province = db.provinces;
const Amphure = db.amphures;
const Rate = db.rates
const Role = db.roles;
const ImposeMenu = db.impose_menus;
const sequelize = db.sequelize;

const query = require('../../helper/query');

let conditions, select, order;

const resolvers = {
    Query: {
        getCategoryOption: async () => {
            conditions = {
                status_delete: 0
            };
            select = ['id', 'name', 'name_en'];
            const categories = await query.findAllByConditions(conditions, Category, select);
            if (!categories) {
                return {
                    status: {
                        code: 2,
                        message: "Not found data in database!"
                    }
                };
            }

            let options = [];
            for (const item of categories) {
                let tmp = {
                    value: item.id,
                    label: `${item.name} ${item.name_en}`
                };
                options.push(tmp);
            }

            return {
                status: {
                    code: 1,
                    message: "success"
                },
                result: {
                    data: options
                }
            };
        },
        getPackageOption: async (_, {}, { context }) => {
            conditions = {
                status_delete: 0,
                customer_id: context.customerId
            };
            select = ['uuid', 'name', 'price'];
            order = [
                ['price', 'ASC']
            ];
            const packages = await query.findAllByConditions(conditions, Package, select, [], order);
            if (!packages) {
                return {
                    status: {
                        code: 2,
                        message: "Not found data in database!"
                    }
                };
            }

            let options = [];
            for (const item of packages) {
                let tmp = {
                    value: item.uuid,
                    label: `${item.price}฿ ${item.name}`
                };
                options.push(tmp);
            }

            return {
                status: {
                    code: 1,
                    message: "success"
                },
                result: {
                    data: options
                }
            };
        },
        getProvinceOption: async () => {
            select = ['id', 'name', 'name_en'];
            const provinces = await query.findAllByConditions({}, Province, select);
            if (!provinces) {
                return {
                    status: {
                        code: 2,
                        message: "Not found data in database!"
                    }
                };
            }

            let options = [];
            for (const item of provinces) {
                let tmp = {
                    value: item.id,
                    label: `${item.name} ${item.name_en}`
                };
                options.push(tmp);
            }

            return {
                status: {
                    code: 1,
                    message: "success"
                },
                result: {
                    data: options
                }
            };
        },
        getAmphureOption: async (_, { provinceId }) => {
            condition = {
                province_id: provinceId
            }
            select = ['id', 'name', 'name_en', 'code'];
            const amphures = await query.findAllByConditions(condition, Amphure, select);
            if (!amphures) {
                return {
                    status: {
                        code: 2,
                        message: "Not found data in database!"
                    }
                };
            }

            let options = [];
            for (const item of amphures) {
                let tmp = {
                    value: item.id,
                    label: `${item.name} ${item.name_en}`,
                    postcode: item.code

                };
                options.push(tmp);
            }

            return {
                status: {
                    code: 1,
                    message: "success"
                },
                result: {
                    data: options
                }
            };
        },
        getRateOption: async () => {
            select = ['id', 'code', 'description'];
            const rates = await query.findAllByConditions({}, Rate, select);
            if (!rates) {
                return {
                    status: {
                        code: 2,
                        message: "Not found data in database!"
                    }
                };
            }

            let options = [];
            for (const item of rates) {
                let tmp = {
                    value: item.id,
                    label: `${item.code}: ${item.description}`
                };
                options.push(tmp);
            }

            return {
                status: {
                    code: 1,
                    message: "success"
                },
                result: {
                    data: options
                }
            };
        },
        getRoleOption: async (_, {}, { context }) => {
            conditions = {
                status_delete: 0,
                created_by: context.userId
            };
            select = ['id', 'name'];
            const roles = await query.findAllByConditions(conditions, Role, select);
            if (!roles) {
                return {
                    status: {
                        code: 2,
                        message: "Not found data in database!"
                    }
                };
            }

            let options = [];
            for (const item of roles) {
                let tmp = {
                    value: item.id,
                    label: `${item.name}`
                };
                options.push(tmp);
            }

            return {
                status: {
                    code: 1,
                    message: "success"
                },
                result: {
                    data: options
                }
            };
        },
        getMenuOption: async (_, {}, { context }) => {
            conditions = {
                is_admin: context.isAdmin
            };
            select = ['id', 'name'];
            const menu = await query.findAllByConditions(conditions, ImposeMenu, select);
            if (!menu) {
                return {
                    status: {
                        code: 2,
                        message: "Not found data in database!"
                    }
                };
            }

            let options = [
                { value: 1, label: 'Dashboard' }
            ];
            for (const item of menu) {
                let tmp = {
                    value: item.id,
                    label: `${item.name}`
                };
                options.push(tmp);
            }

            return {
                status: {
                    code: 1,
                    message: "success"
                },
                result: {
                    data: options
                }
            };
        },
        getAmphureOptionByPostcode: async (_, { postcode }) => {
            conditions = {
                code: postcode
            }
            const count = await query.countDataRows(conditions, Amphure)
            if (count > 0) {
                select = [
                    [sequelize.col('id'), 'id'],
                    [sequelize.col('province_id'), 'province_id'],
                    [sequelize.col('code'), 'code'],
                    [sequelize.col('name'), 'name_th'],
                    [sequelize.col('name_en'), 'name_en'],
                ];
                const amphure = await query.findOneByConditions(conditions, Amphure, select)
                if (!amphure) {
                    return {
                        status: {
                            code: 2,
                            message: "Not found data in database!"
                        }
                    };
                }

                select = [
                    [sequelize.col('id'), 'id'],
                    [sequelize.col('name'), 'name_th'],
                    [sequelize.col('name_en'), 'name_en'],
                ];
                conditions = {
                    id: amphure.province_id
                }
                const province = await query.findOneByConditions(conditions, Province, select)
                province.province = province
                province.amphure = amphure

                return {
                    status: {
                        code: 1,
                        message: "success"
                    },
                    result: {
                        data: province
                    }
                };
            }
            else {
                return {
                    status: {
                        code: 2,
                        message: "Not found data in database!"
                    },

                };
            }
        }
    }
};

module.exports = resolvers;