module.exports = (sequelize, Sequelize) => {
    const Impose_menus = sequelize.define(
        'impose_menus' ,
        {
            id: {
                type: Sequelize.INTEGER ,
                field: 'id' ,
                autoIncrement: true ,
                primaryKey: true
            } ,
            name: {
                type: Sequelize.STRING(100) ,
                field: 'name'
            } ,
            is_admin: {
                type: Sequelize.BOOLEAN ,
                field: 'is_admin'
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
    return Impose_menus;
};