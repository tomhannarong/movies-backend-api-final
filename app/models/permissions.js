module.exports = (sequelize, Sequelize) => {
    const Permissions = sequelize.define(
        'permissions' ,
        {
            id: {
                type: Sequelize.INTEGER ,
                field: 'id' ,
                autoIncrement: true ,
                primaryKey: true
            } ,
            role_id: {
                type: Sequelize.INTEGER ,
                field: 'role_id'
            } ,
            impose_menu_id: {
                type: Sequelize.INTEGER ,
                field: 'impose_menu_id'
            }
        } ,
        {
            timestamps: false ,
            freezeTableName: true
        }
    );
    return Permissions;
};