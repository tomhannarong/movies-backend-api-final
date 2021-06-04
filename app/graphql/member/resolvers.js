const db = require('../../../config/db');
const Op = db.Sequelize.Op;
const sequelize = db.sequelize;
const Member = db.member;
const Package = db.packages;

const config = require('config');
const baseUrl = config.baseUrl;

const query = require('../../helper/query');

let conditions, select, join, order;
let page = 1;
let limit = 10;
let checkPermission = false;

const resolvers = {
    Query: {
        getMember: async (_, { input }, { context }) => {
            if (input.page) page = input.page;
            if (input.limit) limit = input.limit;
            let keyword = input.keyword;

            try {
                if (context.isAdmin == 1) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 2) {
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
                    customer_id: context.customerId
                };
                if (keyword) {
                    conditions = {
                        customer_id: context.customerId,
                        [Op.or]: {
                            uuid: { [Op.regexp]: keyword },
                            name: { [Op.regexp]: keyword },
                            email: { [Op.regexp]: keyword }
                        }
                    };
                }
                const total = await query.countDataRows(conditions, Member);
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
                    [sequelize.col('member.uuid'), 'member_uuid'],
                    [sequelize.col('member.name'), 'member_name'],
                    [sequelize.col('member.email'), 'member_email'],
                    [sequelize.col('package.uuid'), 'package_uuid'],
                    [sequelize.col('package.name'), 'package_name']
                ];
                join = [
                    { model: Package, attributes: [], require: true }
                ];
                order = [
                    ['created_at', 'DESC']
                ];
                const member = await query.findAllLimitByConditions(conditions, Member, select, join, order, page, limit);

                for (const item of member) {
                    item.package = {
                        package_uuid: item.package_uuid,
                        package_name: item.package_name
                    };
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
                        data: member
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
    }
};

module.exports = resolvers;