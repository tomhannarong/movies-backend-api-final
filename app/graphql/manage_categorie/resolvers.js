
const db = require('../../../config/db');
const sequelize = db.sequelize;
const Op = db.Sequelize.Op;

const ManageCategory = db.manage_categories;
const MovieCategory = db.movie_categories;
const Category = db.categories;
const Movie = db.movies;
const query = require('../../helper/query');
const functions = require('../../helper/functions');

let conditions, select, order, data;

const resolvers = {
    Query: {
        getManageHomeCategories: async (_, { }, { context }) => {
            console.log(context)
            try {
                const customerId = context.customerId;

                if (context.isAdmin == 1) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 10) {
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
                    customer_id: customerId
                }
                select = [
                    [sequelize.col('category.id'), 'category_id'],
                    [sequelize.col('category.name'), 'category_name'],
                    [sequelize.col('category.name_en'), 'category_name_en'],
                ];
                join = [
                    { model: Category, where: { status_delete: 0 }, attributes: [], require: true },
                ];
                order = [
                    ['id', 'ASC']
                ];
                const dataShowCategories = await query.findAllByConditions(conditions, ManageCategory, select, join, order);

                let idCategories = [];
                for (const item of dataShowCategories) {
                    idCategories.push(item.category_id)
                }

                conditions = {
                    status_delete: 0,
                    is_comingsoon: 0,
                    customer_id: customerId
                };
                select = [
                    [sequelize.col('category.id'), 'category_id'],
                    [sequelize.col('category.name'), 'category_name'],
                    [sequelize.col('category.name_en'), 'category_name_en'],
                ];
                join = [
                    { model: Category, where: { status_delete: 0, id: { [Op.notIn]: idCategories } }, attributes: [], require: true },
                    { model: Movie, where: conditions, attributes: [], require: true },
                ];
                group = ['category.id'];
                const dataHiddenCategories = await query.findAllByConditions({}, MovieCategory, select, join, [], group);

                return {
                    status: {
                        code: 1,
                        message: "Success"
                    },
                    result: {
                        dataShow: dataShowCategories,
                        dataHidden: dataHiddenCategories
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
        getManageHomeCategoriesByName: async (_, { name }, { context }) => {
            try {
                const customerId = context.customerId;

                if (context.isAdmin == 1) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 10) {
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
                    customer_id: customerId
                }
                select = [
                    [sequelize.col('category.id'), 'category_id'],
                    [sequelize.col('category.name'), 'category_name'],
                    [sequelize.col('category.name_en'), 'category_name_en'],
                ];
                join = [
                    { model: Category, where: { status_delete: 0 }, attributes: [], require: true },
                ];
                order = [
                    ['id', 'ASC']
                ];
                const dataShowCategories = await query.findAllByConditions(conditions, ManageCategory, select, join, order);

                let idCategories = [];
                for (const item of dataShowCategories) {
                    idCategories.push(item.category_id)
                }

                conditions = {
                    status_delete: 0,
                    is_comingsoon: 0,
                    customer_id: customerId
                };
                select = [
                    [sequelize.col('category.id'), 'category_id'],
                    [sequelize.col('category.name'), 'category_name'],
                    [sequelize.col('category.name_en'), 'category_name_en'],
                ];
                join = [
                    {
                        model: Category,
                        where: {
                            status_delete: 0,
                            id: { [Op.notIn]: idCategories },
                            [Op.or]: {
                                name: { [Op.substring]: name },
                                name_en: { [Op.substring]: name },
                            },
                        },
                        attributes: [], require: true
                    },
                    { model: Movie, where: conditions, attributes: [], require: true },
                ];
                group = ['category.id'];
                const dataHiddenCategories = await query.findAllByConditions({}, MovieCategory, select, join, [], group);

                return {
                    status: {
                        code: 1,
                        message: "Success"
                    },
                    result: {
                        dataShow: dataShowCategories,
                        dataHidden: dataHiddenCategories
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
        updateManageHomeCategories: async (_, { categoriesId }, { context }) => {
            try {
                if (context.isAdmin == 1) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 10) {
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

                const deleteDataManageCategory = await ManageCategory.destroy({
                    where: {
                        customer_id: context.customerId,
                    }
                });

                for (const item of categoriesId) {
                    data = {
                        customer_id: context.customerId,
                        category_id: item
                    };
                    const createDataManageCategory = await ManageCategory.create(data);
                }

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
}
module.exports = resolvers;