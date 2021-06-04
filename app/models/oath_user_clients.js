module.exports = (sequelize, Sequelize) => {
    const Oath_user_clients = sequelize.define(
        'oath_user_clients' ,
        {
            id: {
                type: Sequelize.INTEGER ,
                field: 'id' ,
                autoIncrement: true ,
                primaryKey: true
            } ,
            user_id: {
                type: Sequelize.INTEGER ,
                field: 'user_id'
            } ,
            uuid: {
                type: Sequelize.STRING(255) ,
                field: 'uuid'
            },
            name: {
                type: Sequelize.STRING(255) ,
                field: 'name'
            } ,
            address: {
                type: Sequelize.STRING(255) ,
                field: 'address'
            } ,
            secret_key: {
                type: Sequelize.STRING(255) ,
                field: 'secret_key'
            } ,
            ip_adress: {
                type: Sequelize.STRING(20) ,
                field: 'ip_adress'
            } ,
            is_active: {
                type: Sequelize.BOOLEAN ,
                field: 'is_active'
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
            timestamps: false ,
            freezeTableName: true
        }
    );
    return Oath_user_clients;
};