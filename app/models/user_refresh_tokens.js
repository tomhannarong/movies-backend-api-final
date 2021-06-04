module.exports = (sequelize, Sequelize) => {
    const User_refresh_tokens = sequelize.define(
        'user_refresh_tokens' ,
        {
            id: {
                type: Sequelize.INTEGER ,
                field: 'id' ,
                autoIncrement: true ,
                primaryKey: true
            } ,
            client_id: {
                type: Sequelize.INTEGER,
                field: 'client_id'
            } ,
            token: {
                type: Sequelize.STRING(255) ,
                field: 'token'
            } ,
            refresh: {
                type: Sequelize.STRING(255) ,
                field: 'refresh'
            } ,
            created_at: {
                type: Sequelize.DATE ,
                field: 'created_at'
            } ,
            updated_at: {
                type: Sequelize.DATE ,
                field: 'updated_at'
            } ,
            token_expire_at: {
                type: Sequelize.DATE ,
                field: 'token_expire_at'
            } ,
            refresh_expire_at: {
                type: Sequelize.DATE ,
                field: 'refresh_expire_at'
            }
        } ,
        {
            timestamps: false ,
            freezeTableName: true
        }
    );
    return User_refresh_tokens;
};