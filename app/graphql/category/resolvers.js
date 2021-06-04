const db = require('../../../config/db');
const Op = db.Sequelize.Op;
const sequelize = db.sequelize;
const Category = db.categories;
const User = db.users;

const query = require('../../helper/query');
const functions = require('../../helper/functions');

let conditions, select, data;
let checkPermission = false;

const resolvers = {
    Query: {
        getCategory: async (_, { }, { context }) => {
            try {
                if (context.isAdmin != 0) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 4) {
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
                select = ['id', 'name', 'name_en', 'created_by', 'updated_by'];
                order = [
                    ['created_at', 'DESC']
                ];

                const categories = await query.findAllByConditions(conditions, Category, select, _, order);

                for (const item of categories) {
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

                    item.category_id = item.id;
                    item.category_name = item.name;
                    item.category_name_en = item.name_en;
                    item.created_by = createdBy;
                    item.updated_by = updatedBy;
                }

                return {
                    status: {
                        code: 1,
                        message: "Success"
                    },
                    result: {
                        data: categories
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
        createCategory: async (_, { input }, { context }) => {
            const categoryName = input.category_name;
            const categoryNameEn = input.category_name_en;

            try {
                if (context.isAdmin != 0) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 4) {
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
                        name: { [Op.or]: [categoryName, categoryNameEn] },
                        name_en: { [Op.or]: [categoryName, categoryNameEn] }
                    }
                };
                const checkCategorys = await query.findAllByConditions(conditions, Category);
                if (checkCategorys.length > 0) {
                    let duplicate = {
                        name: 0,
                        name_en: 0
                    };
                    for (const checkCategory of checkCategorys) {
                        if (checkCategory.name == categoryName) duplicate.name = 1;
                        if (checkCategory.name_en == categoryNameEn) duplicate.name_en = 1;
                    }
                    let messageDuplicate = "";
                    if (duplicate.name === 1) messageDuplicate = messageDuplicate + " Customer Name,";
                    if (duplicate.name_en === 1) messageDuplicate = messageDuplicate + " Name Eng,";
                    messageDuplicate = messageDuplicate.substr(0, messageDuplicate.length - 1);


                    return {
                        status: {
                            code: 2,
                            message: `Duplicate! ${messageDuplicate}`
                        },
                        result: {
                            duplicate: duplicate
                        }
                    };
                }

                data = {
                    name: categoryName,
                    name_en: categoryNameEn,
                    created_by: context.userId
                };
                let createCategory = await Category.create(data);
                createCategory = createCategory.get({ plain: true });

                data = {
                    category_id: createCategory.id,
                    category_name: createCategory.name,
                    category_name_en: createCategory.name_en,
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
        updateCategory: async (_, { input }, { context }) => {
            const categoryId = input.category_id;
            const categoryName = input.category_name;
            const categoryNameEn = input.category_name_en;

            try {
                if (context.isAdmin != 0) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 4) {
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
                    id: categoryId
                };
                const oldCategory = await query.findOneByConditions(conditions, Category);
                if (!oldCategory) {
                    return {
                        status: {
                            code: 2,
                            message: "Not found data in database!"
                        },
                        result: {}
                    };
                }

                if (oldCategory.name == categoryName && oldCategory.name_en == categoryNameEn) {
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
                        name: { [Op.or]: [categoryName, categoryNameEn] },
                        name_en: { [Op.or]: [categoryName, categoryNameEn] }
                    },
                    id: { [Op.ne]: categoryId }
                };
                const checkCategorys = await query.findAllByConditions(conditions, Category);
                console.log("checkCategorys");
                console.log(checkCategorys);

                if (checkCategorys.length > 0) {
                    let duplicate = {
                        name: 0,
                        name_en: 0
                    };

                    for (const checkCategory of checkCategorys) {
                        if (checkCategory.name == categoryName) duplicate.name = 1;
                        if (checkCategory.name_en == categoryNameEn) duplicate.name_en = 1;
                    }

                    let messageDuplicate = "";
                    if (duplicate.name === 1) messageDuplicate = messageDuplicate + " Customer Name,";
                    if (duplicate.name_en === 1) messageDuplicate = messageDuplicate + " Name Eng,";
                    messageDuplicate = messageDuplicate.substr(0, messageDuplicate.length - 1);

                    return {
                        status: {
                            code: 2,
                            message: `Duplicate! ${messageDuplicate}`
                        },
                        result: {
                            duplicate: duplicate
                        }
                    };
                }

                /* 
                                conditions = {
                                    status_delete: 0,
                                    [Op.or]: {
                                        name: { [Op.or]: [categoryName, categoryNameEn] },
                                        name_en: { [Op.or]: [categoryName, categoryNameEn] }
                                    },
                                    id: { [Op.ne]: categoryId }
                                };
                                const checkCategoryAll = await query.countDataRows(conditions, Category);
                                if (checkCategoryAll > 0) {
                                    return {
                                        status: {
                                            code: 2,
                                            message: "Duplicate!"
                                        },
                                        result: {}
                                    };
                                } */

                data = {
                    name: categoryName,
                    name_en: categoryNameEn,
                    updated_by: context.userId,
                    updated_at: functions.dateTimeNow()
                };
                await Category.update(data, { where: { id: categoryId } });

                data = {
                    category_id: categoryId,
                    category_name: categoryName,
                    category_name_en: categoryNameEn,
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
        deleteCategory: async (_, { categoryId }, { context }) => {
            try {
                if (context.isAdmin != 0) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 4) {
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
                    id: categoryId
                };
                const checkCategory = await query.countDataRows(conditions, Category);
                if (checkCategory == 0) {
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
                await Category.update(data, { where: { id: categoryId } });

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