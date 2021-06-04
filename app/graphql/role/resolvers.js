const db = require('../../../config/db');
const Op = db.Sequelize.Op;
const sequelize = db.sequelize;
const Role = db.roles;
const Permission = db.permissions;
const ImposeMenu = db.impose_menus;
const User = db.users;

const query = require('../../helper/query');
const functions = require('../../helper/functions');

let conditions, select, join, order, data;

const resolver = {
    Query: {
        getRole: async (_, { }, { context }) => {
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
                    created_by: context.userId
                };
                select = ['id', 'name', 'created_by', 'updated_by'];
                order = [
                    ['created_at', 'DESC']
                ];
                const roles = await query.findAllByConditions(conditions, Role, select, [], order);

                for (const item of roles) {
                    conditions = {
                        role_id: item.id
                    };
                    select = [
                        [sequelize.col('impose_menu.id'), 'impose_menu_id'],
                        [sequelize.col('impose_menu.name'), 'menu']
                    ];
                    join = [
                        { model: ImposeMenu, attributes: [], require: true }
                    ];
                    const permissions = await query.findAllByConditions(conditions, Permission, select, join);

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

                    item.role_id = item.id;
                    item.role_name = item.name;
                    item.permissions = permissions;
                    item.created_by = createdBy;
                    item.updated_by = updatedBy;
                }

                return {
                    status: {
                        code: 1,
                        message: "Success"
                    },
                    result: {
                        data: roles
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
        createRole: async (_, { input }, { context }) => {
            const roleName = input.role_name;
            const listImposeMenuId = input.list_impose_menu_id;
            const listMenuId = listImposeMenuId.split(',');

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
                    name: roleName,
                    created_by: context.userId
                };
                const checkRole = await query.countDataRows(conditions, Role);
                if (checkRole > 0) {
                    let duplicate = {
                        name: 1
                    }
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
                    name: roleName,
                    created_by: context.userId
                };
                let createRole = await Role.create(data);
                createRole = createRole.get({ plain: true });

                for (const item of listMenuId) {
                    data = {
                        role_id: createRole.id,
                        impose_menu_id: item
                    };
                    await Permission.create(data);
                }

                conditions = {
                    id: {
                        [Op.in]: listMenuId
                    }
                };
                select = [
                    [sequelize.col('impose_menus.id'), 'impose_menu_id'],
                    [sequelize.col('impose_menus.name'), 'menu']
                ];
                const permissions = await query.findAllByConditions(conditions, ImposeMenu, select);

                data = {
                    role_id: createRole.id,
                    role_name: roleName,
                    permissions: permissions,
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
        updateRole: async (_, { input }, { context }) => {
            const roleId = input.role_id;
            const roleName = input.role_name;
            const listImposeMenuId = input.list_impose_menu_id;
            const listMenuId = listImposeMenuId.split(',').map(item => Number(item));

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
                    id: roleId,
                    created_by: context.userId
                };
                const oldRole = await query.findOneByConditions(conditions, Role);
                if (!oldRole) {
                    return {
                        status: {
                            code: 2,
                            message: "Not found data in database!"
                        },
                        result: {}
                    };
                }

                conditions = {
                    role_id: roleId
                };
                select = ['impose_menu_id'];
                const checkPermission = await query.findAllByConditions(conditions, Permission, select);

                let checkListMenuId = [];
                for (const item of checkPermission) {
                    checkListMenuId.push(item.impose_menu_id);
                }
                const comparePermission = await functions.compareArrayNumber(listMenuId, checkListMenuId);

                if (oldRole.name == roleName && comparePermission) {
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
                    name: roleName,
                    created_by: context.userId
                };

                const checkRole = await query.countDataRows(conditions, Role);
                if (checkRole > 0 && oldRole.name != roleName) {
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
                    name: roleName,
                    updated_by: context.userId,
                    updated_at: functions.dateTimeNow()
                };
                await Role.update(data, { where: { id: roleId } });
                await Permission.destroy({ where: { role_id: roleId } });

                for (const item of listMenuId) {
                    data = {
                        role_id: roleId,
                        impose_menu_id: item
                    };
                    await Permission.create(data);
                }

                conditions = {
                    id: {
                        [Op.in]: listMenuId
                    }
                };
                select = [
                    [sequelize.col('impose_menus.id'), 'impose_menu_id'],
                    [sequelize.col('impose_menus.name'), 'menu']
                ];
                const permissions = await query.findAllByConditions(conditions, ImposeMenu, select);

                data = {
                    role_id: roleId,
                    role_name: roleName,
                    permissions: permissions,
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
        deleteRole: async (_, { roleId }, { context }) => {
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
                    id: roleId,
                    created_by: context.userId
                };
                const checkRole = await query.countDataRows(conditions, Role);
                if (checkRole == 0) {
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
                await Role.update(data, { where: { id: roleId } });

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

module.exports = resolver;