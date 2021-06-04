module.exports = (sequelize, Sequelize) => {
    const Member = sequelize.define(
        'member' ,
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
                type: Sequelize.STRING(50) ,
                field: 'name'
            } ,
            email: {
                type: Sequelize.STRING(100) ,
                field: 'email'
            } ,
            password: {
                type: Sequelize.STRING(255) ,
                field: 'password'
            } ,
            is_verified: {
                type: Sequelize.BOOLEAN ,
                field: 'is_verified'
            } ,
            salt_key: {
                type: Sequelize.STRING(255) ,
                field: 'salt_key'
            } ,
            remember_token: {
                type: Sequelize.STRING(255) ,
                field: 'remember_token'
            } ,
            avatar: {
                type: Sequelize.STRING(100) ,
                field: 'avatar'
            } ,
            customer_id: {
                type: Sequelize.INTEGER ,
                field: 'customer_id'
            } ,
            package_id: {
                type: Sequelize.INTEGER ,
                field: 'package_id'
            } ,
            status_member_id: {
                type: Sequelize.INTEGER ,
                field: 'status_member_id'
            } ,
            created_at: {
                type: Sequelize.DATE ,
                field: 'created_at'
            } ,
            updated_at: {
                type: Sequelize.DATE ,
                field: 'updated_at'
            }  
        } ,
        {
            timestamps: false,
            freezeTableName: true
        }
    );
    return Member;
};