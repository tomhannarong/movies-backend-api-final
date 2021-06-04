module.exports = (sequelize, Sequelize) => {
    const Users = sequelize.define(
        'users' ,
        {
            id: {
                type: Sequelize.INTEGER ,
                field: 'id' ,
                autoIncrement: true ,
                primaryKey: true
            } ,
            uuid: {
                type: Sequelize.STRING(255) ,
                field: 'uuid'
            } ,
            name: {
                type: Sequelize.STRING(100) ,
                field: 'name'
            } ,
            avatar: {
                type: Sequelize.STRING(100) ,
                field: 'avatar'
            } ,
            email: {
                type: Sequelize.STRING(100) ,
                field: 'email'
            } ,
            password: {
                type: Sequelize.STRING(255) ,
                field: 'password'
            },
            salt_key: {
                type: Sequelize.STRING(255) ,
                field: 'salt_key'
            } ,
            is_admin: {
                type: Sequelize.BOOLEAN ,
                field: 'is_admin'
            } ,
            is_active: {
                type: Sequelize.BOOLEAN ,
                field: 'is_active'
            } ,
            customer_id: {
                type: Sequelize.INTEGER ,
                field: 'customer_id'
            } ,
            role_id: {
                type: Sequelize.INTEGER ,
                field: 'role_id'
            } ,
            status_delete: {
                type: Sequelize.BOOLEAN ,
                field: 'status_delete'
            } ,
            created_by: {
                type: Sequelize.INTEGER ,
                field: 'created_by'
            } ,
            updated_by: {
                type: Sequelize.INTEGER ,
                field: 'updated_by'
            } ,
            deleted_by: {
                type: Sequelize.INTEGER ,
                field: 'deleted_by'
            } ,
            created_at: {
                type: Sequelize.DATE ,
                field: 'created_at'
            } ,
            updated_at: {
                type: Sequelize.DATE ,
                field: 'updated_at'
            } ,
            deleted_at: {
                type: Sequelize.DATE ,
                field: 'deleted_at'
            }  
        } ,
        {
            timestamps: false ,
            freezeTableName: true
        }
    );
    return Users;
};